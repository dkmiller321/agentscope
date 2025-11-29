from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, Text, JSON, Float, Boolean
from sqlalchemy.orm import relationship
import datetime
from .database import Base

# Association table for user-organization many-to-many relationship
user_organization = Table(
    'user_organization', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('organization_id', Integer, ForeignKey('organizations.id'))
)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    is_active = Column(Boolean, default=True)
    
    organizations = relationship("Organization", secondary=user_organization, back_populates="members")

class Organization(Base):
    __tablename__ = 'organizations'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    members = relationship("User", secondary=user_organization, back_populates="organizations")
    projects = relationship("Project", back_populates="organization")

class Project(Base):
    __tablename__ = 'projects'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text)
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    organization = relationship("Organization", back_populates="projects")
    runs = relationship("AgentRun", back_populates="project")
    tests = relationship("TestCase", back_populates="project")

class AgentRun(Base):
    __tablename__ = 'agent_runs'
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    name = Column(String, index=True)
    status = Column(String, default='running')
    model = Column(String)
    cost = Column(Float)
    duration = Column(Float)
    input_tokens = Column(Integer)
    output_tokens = Column(Integer)
    parameters = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime)
    error_log = Column(Text)
    
    project = relationship("Project", back_populates="runs")
    tool_calls = relationship("ToolCall", back_populates="run")

class TestCase(Base):
    __tablename__ = 'test_cases'
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    name = Column(String, index=True, nullable=False)
    description = Column(Text)
    test_script = Column(Text)
    last_run = Column(DateTime)
    last_status = Column(String)
    
    project = relationship("Project", back_populates="tests")

class ToolCall(Base):
    __tablename__ = 'tool_calls'
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey('agent_runs.id'), nullable=False)
    tool_name = Column(String, nullable=False)
    parameters = Column(JSON)
    result = Column(JSON)
    status = Column(String)
    error_message = Column(Text)
    latency = Column(Float)
    called_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    run = relationship("AgentRun", back_populates="tool_calls")

class MCPToolEndpoint(Base):
    __tablename__ = 'mcp_tool_endpoints'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    endpoint_url = Column(String, nullable=False)
    api_key = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)
    parameters = Column(JSON)
