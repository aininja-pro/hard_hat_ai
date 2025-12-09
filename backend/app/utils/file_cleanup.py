"""
File Cleanup Utilities
Ensures zero data retention by automatically cleaning up processed files
"""

import os
import tempfile
from pathlib import Path
from typing import List
import logging

logger = logging.getLogger(__name__)


class FileCleanup:
    """Handles automatic cleanup of temporary files"""

    @staticmethod
    def cleanup_file(file_path: str) -> bool:
        """
        Safely delete a file
        
        Args:
            file_path: Path to file to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up file: {file_path}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error cleaning up file {file_path}: {str(e)}")
            return False

    @staticmethod
    def cleanup_files(file_paths: List[str]) -> int:
        """
        Clean up multiple files
        
        Args:
            file_paths: List of file paths to delete
            
        Returns:
            Number of files successfully deleted
        """
        cleaned = 0
        for file_path in file_paths:
            if FileCleanup.cleanup_file(file_path):
                cleaned += 1
        return cleaned

    @staticmethod
    def create_temp_file(prefix: str = "hardhat_", suffix: str = "") -> str:
        """
        Create a temporary file that will be automatically cleaned up
        
        Args:
            prefix: File prefix
            suffix: File suffix (e.g., '.pdf')
            
        Returns:
            Path to temporary file
        """
        temp_dir = tempfile.gettempdir()
        fd, path = tempfile.mkstemp(prefix=prefix, suffix=suffix, dir=temp_dir)
        os.close(fd)  # Close file descriptor, we'll open it when needed
        return path

    @staticmethod
    def cleanup_temp_files(prefix: str = "hardhat_") -> int:
        """
        Clean up all temporary files with a given prefix
        
        Args:
            prefix: Prefix to match files
            
        Returns:
            Number of files cleaned up
        """
        temp_dir = Path(tempfile.gettempdir())
        cleaned = 0
        
        try:
            for file_path in temp_dir.glob(f"{prefix}*"):
                if file_path.is_file():
                    if FileCleanup.cleanup_file(str(file_path)):
                        cleaned += 1
        except Exception as e:
            logger.error(f"Error cleaning up temp files: {str(e)}")
        
        return cleaned


# Context manager for automatic cleanup
class TemporaryFile:
    """Context manager for temporary files that auto-cleanup"""

    def __init__(self, prefix: str = "hardhat_", suffix: str = ""):
        self.prefix = prefix
        self.suffix = suffix
        self.path = None

    def __enter__(self):
        self.path = FileCleanup.create_temp_file(self.prefix, self.suffix)
        return self.path

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.path:
            FileCleanup.cleanup_file(self.path)

