"""
Script to ingest NCERT Class 10 Science PDFs.
1. Parses PDFs using PyMuPDF (fitz)
2. Chunks text by ~500 tokens with overlap
3. Generates embeddings using the HuggingFace Inference API (via the embedder service)
4. Inserts into the PostgreSQL database (pgvector content_chunks table)
"""

import asyncio
import os
from pathlib import Path
import fitz  # PyMuPDF
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Ensure we can import from app
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import get_settings
from app.core.database import AsyncSessionLocal
from app.models.content import ContentChunk
from app.services.rag.embedder import embed_batch

settings = get_settings()

PDF_DIR = Path(__file__).parent.parent.parent / "science_10th_book"

# Basic mapping of chapter number to title (can be extracted dynamically, but this is safer)
CHAPTERS = {
    1: "Chemical Reactions and Equations",
    2: "Acids, Bases and Salts",
    3: "Metals and Non-metals",
    4: "Carbon and its Compounds",
    5: "Life Processes",
    6: "Control and Coordination",
    7: "How do Organisms Reproduce?",
    8: "Heredity",
    9: "Light – Reflection and Refraction",
    10: "The Human Eye and the Colourful World",
}


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract all text from a PDF file."""
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text("text") + "\n"
    return text


def chunk_text(text: str, chunk_size: int = 2000, overlap: int = 200) -> list[str]:
    """
    Naively chunk text by character length (can be upgraded to token-based later).
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk.strip())
        start = end - overlap
    return chunks


async def main():
    print("Starting NCERT PDF Ingestion...")
    
    if not PDF_DIR.exists():
        print(f"Error: Directory {PDF_DIR} not found.")
        return

    pdf_files = list(PDF_DIR.glob("*.pdf"))
    if not pdf_files:
        print("No PDF files found in directory.")
        return

    all_chunks_data = []

    for pdf_file in pdf_files:
        print(f"Processing: {pdf_file.name}")
        
        # Try to extract chapter number from filename
        # Expected format: ncert-books-class-10-science-chapter-1.pdf
        try:
            # handle cases like "chapter-7 (1).pdf"
            base_name = pdf_file.stem.split(" (")[0]
            chapter_num = int(base_name.split("-")[-1])
        except ValueError:
            print(f"Warning: Could not parse chapter number from {pdf_file.name}, defaulting to 0.")
            chapter_num = 0
            
        chapter_title = CHAPTERS.get(chapter_num, f"Chapter {chapter_num}")
        skill_id = f"science.c10.ch{chapter_num:02d}"

        text = extract_text_from_pdf(pdf_file)
        text_chunks = chunk_text(text)
        
        print(f"  Extracted {len(text_chunks)} chunks.")
        
        for i, text_chunk in enumerate(text_chunks):
            if len(text_chunk) < 50:
                continue # skip tiny chunks
                
            all_chunks_data.append({
                "source_file": pdf_file.name,
                "chapter_num": chapter_num,
                "chapter_title": chapter_title,
                "topic": f"{chapter_title} - Part {i+1}",
                "skill_id": skill_id,
                "subject": "Science",
                "grade": 10,
                "difficulty": "medium",
                "content_type": "lesson",
                "body": text_chunk,
                "word_count": len(text_chunk.split())
            })

    print(f"Total chunks to embed: {len(all_chunks_data)}")
    
    # Extract just the texts for batch embedding
    texts_to_embed = [item["body"] for item in all_chunks_data]
    
    print("Embedding chunks (this may take a while depending on rate limits)...")
    embeddings = await embed_batch(texts_to_embed, batch_size=16)
    
    print("Inserting into database...")
    async with AsyncSessionLocal() as session:
        for item, embedding in zip(all_chunks_data, embeddings):
            chunk = ContentChunk(
                **item,
                embedding=embedding
            )
            session.add(chunk)
            
        await session.commit()
        
    print("Ingestion complete!")

if __name__ == "__main__":
    asyncio.run(main())
