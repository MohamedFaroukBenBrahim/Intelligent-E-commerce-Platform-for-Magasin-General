# Intelligent-E-commerce-Platform-for-Magasin-General
Intelligent multi-service e-commerce platform developed for Magasin Général, featuring product and order management, recruitment services, AI-powered recommendation systems, chatbot integration, and a voice-enabled virtual assistant.
Magasin Général – Intelligent E-Commerce Platform
Overview

This project is an intelligent multi-service e-commerce platform developed for Magasin Général as part of an End-of-Program Project (PFE).

The platform was designed to modernize and enhance the online shopping experience by combining traditional e-commerce functionalities with Artificial Intelligence solutions. In addition to product management and online purchasing, the platform integrates recruitment services, intelligent recommendation systems, an AI chatbot, and a voice-enabled virtual assistant.

The objective of this project was to create a scalable, maintainable, and user-friendly ecosystem capable of serving both customers and administrators while introducing innovative AI-powered features.

[Insert Project Banner / Home Page Screenshot]

Main Features
Customer Features
Authentication & Account Management
User Registration
User Login
JWT Authentication
Google Authentication
Email Verification
Password Recovery
Logout Functionality

[Insert Authentication Screenshots]

Product Management

Users can:

Browse products
Search products
Filter products
View product details
View product images
Access product recommendations

[Insert Product List Screenshot]

[Insert Product Details Screenshot]

Shopping Cart

The shopping cart allows users to:

Add products
Update quantities
Remove products
Review selected products before checkout

[Insert Cart Screenshot]

Order Management

Users can:

Place orders
View order history
Track order information
Access purchased products

[Insert Order History Screenshot]

User Profile

Users can:

Update personal information
Change profile picture
Change password
Upload CV
Manage personal data
View order history

[Insert User Profile Screenshot]

Recruitment Portal

The recruitment module allows users to:

Browse available job offers
View job details
Upload their CV
Apply for jobs
Receive AI-powered job recommendations

[Insert Recruitment Page Screenshot]

[Insert Job Details Screenshot]

Product Reviews

Users can:

Add reviews
Rate products
Share feedback
View reviews from other users

[Insert Product Review Screenshot]

Artificial Intelligence Features

The platform integrates multiple AI technologies to improve user experience.

Product Recommendation System

The recommendation engine analyzes user behavior and product interactions to suggest relevant products.

Main functionalities:

Personalized recommendations
Popular products suggestions
Intelligent product ranking
Dynamic recommendations

[Insert Recommendation Screenshot]

Job Recommendation System

The recruitment recommendation engine compares user profiles and CV information against available job offers.

Main functionalities:

Personalized job suggestions
Skills matching
Candidate-job compatibility analysis

[Insert Job Recommendation Screenshot]

AI Chatbot

The platform includes an AI-powered chatbot capable of answering questions related to:

Products
Recruitment
General platform information

Features:

Natural language interaction
Context-aware responses
Real-time communication
Multiple conversation contexts

[Insert Chatbot Screenshot]

AI Avatar Assistant

One of the most innovative features of the project is the AI-powered virtual assistant.

The avatar provides:

Voice interaction
Real-time responses
Animated character representation
Lip synchronization
Product assistance
Customer guidance

Users can interact with the avatar directly from the platform and receive spoken responses generated through Artificial Intelligence.

[Insert Avatar Screenshot]

AI Avatar Architecture

The avatar combines several technologies working together.

Llama

Used as the Large Language Model responsible for generating intelligent responses.

Responsibilities:

Understanding user requests
Generating conversational responses
Providing contextual information
ElevenLabs

Used for text-to-speech generation.

Responsibilities:

Convert AI responses into realistic speech
Generate natural voice output
FFmpeg

Used for audio processing.

Responsibilities:

Audio conversion
Audio optimization
Preparation of files for synchronization
Rhubarb Lip Sync

Used for lip synchronization.

Responsibilities:

Analyze generated audio
Create mouth movement data
Synchronize speech and animation
Blender

Used to create and animate the 3D avatar.

Responsibilities:

Character modeling
Character animation
Avatar optimization

[Insert Avatar Workflow Diagram]

Administrator Features

The platform provides a complete administration system.

Product Administration

Administrators can:

Create products
Update products
Delete products
Manage inventory
Manage discounts

[Insert Product Management Screenshot]

Category Administration

Administrators can:

Create categories
Edit categories
Delete categories

[Insert Category Management Screenshot]

Blog Administration

Administrators can:

Create blog posts
Update blog posts
Delete blog posts

[Insert Blog Management Screenshot]

User Administration

Administrators can:

View users
Search users
Change user status
Manage user accounts

[Insert User Management Screenshot]

Recruitment Administration

Administrators can:

Create job offers
Edit job offers
Delete job offers
Manage applications

[Insert Recruitment Management Screenshot]

Statistics Dashboard

Administrators can monitor:

Total users
Orders statistics
Product statistics
Recruitment statistics
Revenue indicators

[Insert Statistics Dashboard Screenshot]

CSV Export

Administrators can export platform data for analysis and reporting purposes.

Supported exports:

User statistics
Orders statistics
Platform analytics

[Insert CSV Export Screenshot]

Technical Architecture

The application follows a Three-Tier Architecture.

Presentation Layer

Technology:

Angular

Responsibilities:

User Interface
User Interaction
API Communication
Application Layer

Technology:

Spring Boot

Responsibilities:

Business Logic
Authentication
Security
REST APIs
Data Layer

Technologies:

MySQL
MinIO

Responsibilities:

Structured Data Storage
Image Storage
CV Storage
File Management

[Insert Architecture Diagram]

Technology Stack
Frontend
Angular
TypeScript
HTML
CSS
Bootstrap
Backend
Spring Boot
Spring Security
Spring Data JPA
JWT Authentication
Spring AI
Database
MySQL
Object Storage
MinIO
Artificial Intelligence
Llama
Groq API
ElevenLabs
Rhubarb Lip Sync
Multimedia
Blender
FFmpeg
Project Structure
frontend/
├── components
├── services
├── guards
├── models

backend/
├── controllers
├── services
├── repositories
├── entities
├── security
├── dto

[Insert Project Structure Screenshot]

Installation
Backend
git clone <repository-url>

cd backend

mvn clean install

mvn spring-boot:run
Frontend
cd frontend

npm install

ng serve
Contributors
Development Team
Mohamed Farouk Ben Brahim
Yahya Souidi
Supervisors
Academic Supervisor
Sana Ezzedine
Industry Supervisor
Sana Dabbousi
Future Improvements

Potential future developments include:

Mobile Application
Advanced Stock Management System
Customer Loyalty Program
Enhanced AI Recommendations
Voice Interaction for Chatbot
Additional Analytics Features
Acknowledgements

We would like to thank the Magasin Général team, our academic supervisors, and everyone who contributed to the successful completion of this project.

Academic Year: 2025–2026
Project Type: End-of-Program Project (PFE)
Host Company: Magasin Général
Institution: Higher Institute of Technological Studies (ISET)
