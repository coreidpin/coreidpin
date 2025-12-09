from setuptools import setup, find_packages

setup(
    name="gidipin-python-sdk",
    version="1.0.0",
    description="Official Python SDK for GidiPIN Platform",
    author="GidiPIN",
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0"
    ],
    python_requires=">=3.7",
)
