from setuptools import setup, find_packages

setup(
    name="component-agent",
    version="0.1.0",
    description="AI agent for creating and improving React components",
    author="HopeAI",
    author_email="info@hopeai.com",
    packages=find_packages(),
    install_requires=[
        "google-genai>=1.12.0",
        "pydantic>=2.5.0",
        "python-dotenv>=1.0.0",
    ],
    entry_points={
        "console_scripts": [
            "component-agent=cli:main",
        ],
    },
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
    ],
    python_requires=">=3.8",
)
