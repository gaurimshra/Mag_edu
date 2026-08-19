"""
Knowledge Graph definitions. Node, Edge, Misconception rules.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, JSON, Enum, Text
import enum
from app.core.database import Base

class KnowledgeNodeType(str, enum.Enum):
    subject = "subject"
    chapter = "chapter"
    skill = "skill"

class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"
    
    id = Column(String(100), primary_key=True) # e.g. "ch01.chemical_reactions"
    name = Column(String(200), nullable=False)
    node_type = Column(Enum(KnowledgeNodeType), default=KnowledgeNodeType.skill)
    description = Column(Text, nullable=True)

class KnowledgeEdge(Base):
    __tablename__ = "knowledge_edges"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(String(100), ForeignKey("knowledge_nodes.id", ondelete="CASCADE")) # Prerequisite
    target_id = Column(String(100), ForeignKey("knowledge_nodes.id", ondelete="CASCADE")) # Concept
    relationship = Column(String(50), default="prerequisite") 

class GlobalMisconception(Base):
    __tablename__ = "global_misconceptions"
    
    id = Column(String(100), primary_key=True) # e.g., "fraction_denominator_add"
    skill_id = Column(String(100), ForeignKey("knowledge_nodes.id", ondelete="CASCADE"))
    description = Column(Text, nullable=False)
    remediation_prompt = Column(Text, nullable=True) # Instruction for the AI tutor to fix this
