#!/usr/bin/env python3
"""
Comprehensive Setup and Run Script for Hospital Management System AI
Installs dependencies, collects data, trains models, and starts all services
"""

import os
import sys
import subprocess
import asyncio
import time
import json
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class HospitalAISetup:
    """Comprehensive setup and run system for Hospital Management AI"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.venv_path = self.project_root / "venv"
        self.requirements_file = self.project_root / "requirements.txt"
        
    def check_python_version(self):
        """Check if Python version is compatible"""
        logger.info("Checking Python version...")
        version = sys.version_info
        if version.major < 3 or (version.major == 3 and version.minor < 8):
            logger.error("Python 3.8 or higher is required")
            return False
        logger.info(f"Python version: {version.major}.{version.minor}.{version.micro}")
        return True
    
    def create_virtual_environment(self):
        """Create virtual environment if it doesn't exist"""
        logger.info("Setting up virtual environment...")
        
        if not self.venv_path.exists():
            logger.info("Creating virtual environment...")
            try:
                subprocess.run([sys.executable, "-m", "venv", str(self.venv_path)], check=True)
                logger.info("Virtual environment created successfully")
            except subprocess.CalledProcessError as e:
                logger.error(f"Failed to create virtual environment: {e}")
                return False
        else:
            logger.info("Virtual environment already exists")
        
        return True
    
    def get_pip_command(self):
        """Get the pip command for the virtual environment"""
        if os.name == 'nt':  # Windows
            return str(self.venv_path / "Scripts" / "pip")
        else:  # Unix/Linux
            return str(self.venv_path / "bin" / "pip")
    
    def get_python_command(self):
        """Get the python command for the virtual environment"""
        if os.name == 'nt':  # Windows
            return str(self.venv_path / "Scripts" / "python")
        else:  # Unix/Linux
            return str(self.venv_path / "bin" / "python")
    
    def upgrade_pip(self):
        """Upgrade pip in the virtual environment"""
        logger.info("Upgrading pip...")
        try:
            pip_cmd = self.get_pip_command()
            subprocess.run([pip_cmd, "install", "--upgrade", "pip"], check=True)
            logger.info("Pip upgraded successfully")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to upgrade pip: {e}")
            return False
    
    def install_core_dependencies(self):
        """Install core dependencies first"""
        logger.info("Installing core dependencies...")
        
        core_deps = [
            "fastapi==0.116.1",
            "uvicorn[standard]==0.35.0",
            "pydantic==2.11.7",
            "python-multipart==0.0.20",
            "pandas==2.3.1",
            "numpy==2.3.1",
            "requests==2.32.4",
            "aiohttp==3.12.14",
            "python-dotenv==1.1.1",
            "pyyaml==6.0.2"
        ]
        
        try:
            pip_cmd = self.get_pip_command()
            for dep in core_deps:
                logger.info(f"Installing {dep}...")
                subprocess.run([pip_cmd, "install", dep], check=True)
            
            logger.info("Core dependencies installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install core dependencies: {e}")
            return False
    
    def install_ai_dependencies(self):
        """Install AI and ML dependencies"""
        logger.info("Installing AI and ML dependencies...")
        
        ai_deps = [
            "torch==2.7.1+cpu",
            "transformers==4.53.2",
            "sentence-transformers==5.0.0",
            "scikit-learn==1.7.0",
            "scipy==1.16.0",
            "matplotlib==3.10.3",
            "seaborn==0.13.2"
        ]
        
        try:
            pip_cmd = self.get_pip_command()
            for dep in ai_deps:
                logger.info(f"Installing {dep}...")
                subprocess.run([pip_cmd, "install", dep], check=True)
            
            logger.info("AI dependencies installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install AI dependencies: {e}")
            return False
    
    def install_medical_dependencies(self):
        """Install medical-specific dependencies"""
        logger.info("Installing medical dependencies...")
        
        medical_deps = [
            "spacy==3.8.7",
            "nltk==3.9.1",
            "textblob==0.19.0",
            "biopython==1.83",
            "pubmed-lookup==0.2.3"
        ]
        
        try:
            pip_cmd = self.get_pip_command()
            for dep in medical_deps:
                logger.info(f"Installing {dep}...")
                subprocess.run([pip_cmd, "install", dep], check=True)
            
            # Download spaCy model
            logger.info("Downloading spaCy model...")
            python_cmd = self.get_python_command()
            subprocess.run([python_cmd, "-m", "spacy", "download", "en_core_web_sm"], check=True)
            
            logger.info("Medical dependencies installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install medical dependencies: {e}")
            return False
    
    def install_remaining_dependencies(self):
        """Install remaining dependencies"""
        logger.info("Installing remaining dependencies...")
        
        try:
            pip_cmd = self.get_pip_command()
            subprocess.run([pip_cmd, "install", "-r", str(self.requirements_file)], check=True)
            logger.info("All dependencies installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install remaining dependencies: {e}")
            return False
    
    def collect_medical_data(self):
        """Collect medical data from various sources"""
        logger.info("Collecting medical data...")
        
        try:
            python_cmd = self.get_python_command()
            script_path = self.project_root / "src" / "data" / "medical_data_collector.py"
            
            # Set PYTHONPATH
            env = os.environ.copy()
            env['PYTHONPATH'] = str(self.project_root / "src")
            
            subprocess.run([python_cmd, str(script_path)], env=env, check=True)
            logger.info("Medical data collection completed")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to collect medical data: {e}")
            return False
    
    def train_ai_models(self):
        """Train AI models on collected data"""
        logger.info("Training AI models...")
        
        try:
            python_cmd = self.get_python_command()
            script_path = self.project_root / "src" / "ai" / "training_system.py"
            
            # Set PYTHONPATH
            env = os.environ.copy()
            env['PYTHONPATH'] = str(self.project_root / "src")
            
            subprocess.run([python_cmd, str(script_path)], env=env, check=True)
            logger.info("AI model training completed")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to train AI models: {e}")
            return False
    
    def start_ai_service(self):
        """Start the AI service"""
        logger.info("Starting AI service...")
        
        try:
            python_cmd = self.get_python_command()
            script_path = self.project_root / "start_ai_service.py"
            
            # Set PYTHONPATH
            env = os.environ.copy()
            env['PYTHONPATH'] = str(self.project_root / "src")
            
            # Start the service in background
            process = subprocess.Popen(
                [python_cmd, str(script_path)],
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            # Wait a bit for service to start
            time.sleep(5)
            
            # Check if service is running
            if process.poll() is None:
                logger.info("AI service started successfully")
                return process
            else:
                logger.error("AI service failed to start")
                return None
                
        except Exception as e:
            logger.error(f"Failed to start AI service: {e}")
            return None
    
    def start_backend_service(self):
        """Start the Node.js backend service"""
        logger.info("Starting backend service...")
        
        try:
            # Navigate to backend directory
            backend_dir = self.project_root.parent / "backend"
            if not backend_dir.exists():
                logger.warning("Backend directory not found")
                return None
            
            # Install backend dependencies
            subprocess.run(["npm", "install", "--legacy-peer-deps"], cwd=backend_dir, check=True)
            
            # Start backend service
            process = subprocess.Popen(
                ["node", "server.js"],
                cwd=backend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            # Wait a bit for service to start
            time.sleep(3)
            
            # Check if service is running
            if process.poll() is None:
                logger.info("Backend service started successfully")
                return process
            else:
                logger.error("Backend service failed to start")
                return None
                
        except Exception as e:
            logger.error(f"Failed to start backend service: {e}")
            return None
    
    def start_frontend_service(self):
        """Start the React frontend service"""
        logger.info("Starting frontend service...")
        
        try:
            # Navigate to project root
            project_root = self.project_root.parent
            
            # Install frontend dependencies
            subprocess.run(["npm", "install", "--legacy-peer-deps"], cwd=project_root, check=True)
            
            # Start frontend service
            process = subprocess.Popen(
                ["npm", "start"],
                cwd=project_root,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            # Wait a bit for service to start
            time.sleep(10)
            
            # Check if service is running
            if process.poll() is None:
                logger.info("Frontend service started successfully")
                return process
            else:
                logger.error("Frontend service failed to start")
                return None
                
        except Exception as e:
            logger.error(f"Failed to start frontend service: {e}")
            return None
    
    def check_services(self):
        """Check if all services are running"""
        logger.info("Checking service status...")
        
        import requests
        
        services = {
            "AI Service": "http://localhost:8000/health",
            "Backend Service": "http://localhost:3001/health",
            "Frontend Service": "http://localhost:3000"
        }
        
        all_running = True
        
        for service_name, url in services.items():
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    logger.info(f"✅ {service_name} is running")
                else:
                    logger.warning(f"⚠️ {service_name} returned status {response.status_code}")
                    all_running = False
            except Exception as e:
                logger.error(f"❌ {service_name} is not running: {e}")
                all_running = False
        
        return all_running
    
    def run_complete_setup(self):
        """Run the complete setup and start all services"""
        logger.info("Starting complete Hospital Management System setup...")
        logger.info("=" * 60)
        
        # Check Python version
        if not self.check_python_version():
            return False
        
        # Create virtual environment
        if not self.create_virtual_environment():
            return False
        
        # Upgrade pip
        if not self.upgrade_pip():
            return False
        
        # Install dependencies
        if not self.install_core_dependencies():
            return False
        
        if not self.install_ai_dependencies():
            return False
        
        if not self.install_medical_dependencies():
            return False
        
        if not self.install_remaining_dependencies():
            return False
        
        # Collect medical data
        if not self.collect_medical_data():
            logger.warning("Medical data collection failed, continuing...")
        
        # Train AI models
        if not self.train_ai_models():
            logger.warning("AI model training failed, continuing...")
        
        # Start services
        ai_process = self.start_ai_service()
        backend_process = self.start_backend_service()
        frontend_process = self.start_frontend_service()
        
        # Check services
        time.sleep(5)
        if self.check_services():
            logger.info("🎉 All services are running successfully!")
            logger.info("=" * 60)
            logger.info("Hospital Management System is ready!")
            logger.info("Frontend: http://localhost:3000")
            logger.info("Backend API: http://localhost:3001")
            logger.info("AI Service: http://localhost:8000")
            logger.info("=" * 60)
            
            # Keep the script running
            try:
                while True:
                    time.sleep(30)
                    if not self.check_services():
                        logger.warning("Some services have stopped")
            except KeyboardInterrupt:
                logger.info("Shutting down services...")
                if ai_process:
                    ai_process.terminate()
                if backend_process:
                    backend_process.terminate()
                if frontend_process:
                    frontend_process.terminate()
                logger.info("Services stopped")
        else:
            logger.error("❌ Some services failed to start")
            return False
        
        return True

def main():
    """Main function"""
    setup = HospitalAISetup()
    success = setup.run_complete_setup()
    
    if success:
        logger.info("Setup completed successfully!")
    else:
        logger.error("Setup failed!")
        sys.exit(1)

if __name__ == "__main__":
    main() 