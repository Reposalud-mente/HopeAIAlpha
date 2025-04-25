"""
File Handler Module

This module contains the FileHandler class that provides functionality
for reading and writing files.
"""

import os
from typing import Optional


class FileHandler:
    """
    File handler class for reading and writing files.
    
    This class provides methods for reading and writing files,
    with support for creating directories and handling file permissions.
    """
    
    def read_file(self, file_path: str) -> str:
        """
        Read a file and return its contents.
        
        Args:
            file_path: Path to the file to read.
        
        Returns:
            The contents of the file.
        
        Raises:
            FileNotFoundError: If the file does not exist.
            PermissionError: If the file cannot be read due to permissions.
        """
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    
    def write_file(self, file_path: str, content: str, overwrite: bool = False) -> str:
        """
        Write content to a file.
        
        Args:
            file_path: Path to the file to write.
            content: Content to write to the file.
            overwrite: Whether to overwrite the file if it already exists.
        
        Returns:
            The path to the written file.
        
        Raises:
            FileExistsError: If the file already exists and overwrite is False.
            PermissionError: If the file cannot be written due to permissions.
        """
        # Check if the file already exists
        if os.path.exists(file_path) and not overwrite:
            raise FileExistsError(f"File {file_path} already exists and overwrite is False.")
        
        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
        
        # Write the file
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        
        return file_path
    
    def ensure_directory(self, directory_path: str) -> str:
        """
        Ensure that a directory exists, creating it if necessary.
        
        Args:
            directory_path: Path to the directory to ensure.
        
        Returns:
            The path to the directory.
        
        Raises:
            PermissionError: If the directory cannot be created due to permissions.
        """
        os.makedirs(directory_path, exist_ok=True)
        return directory_path
