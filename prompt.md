# Prompt

# Context and Role

As a Senior Full-Stack Developer and Software Architect, build a production-grade AI-powered blog platform with modern UI/UX, scalable backend systems, secure APIs, immersive animations, and optimized performance.

The platform must provide a seamless experience for readers, writers, and administrators while following enterprise-level software engineering practices such as:

- Clean Architecture
- Modular Folder Structure
- Reusable Components
- Secure Authentication
- Input Validation
- Error Handling
- SEO Optimization
- Accessibility Compliance
- Performance Optimization
- Production-Ready Deployment

The application should feel modern, responsive, scalable, secure, visually polished, and ready for real-world deployment.

---

# Objective

Develop a complete AI-powered blog platform that includes:

- Modern responsive UI
- Blog CRUD functionality
- Authentication and authorization
- Rich-text and markdown support
- AI-powered recommendations
- Category filtering and search
- Admin dashboard
- Newsletter and contact system
- Error handling and validation
- SEO optimization
- Docker-ready deployment

---

# Table of Contents

- [Project Architecture](#project-architecture)
- [Project Structure](#project-structure)
- [Architecture Layer Responsibilities](#architecture-layer-responsibilities)
- [Routing and Pages](#routing-and-pages)
- [UI and Animation Requirements](#ui-and-animation-requirements)
- [Layout Requirements](#layout-requirements)
- [Blog Management Requirements](#blog-management-requirements)
- [Authentication and Authorization](#authentication-and-authorization)
- [Contact System Requirements](#contact-system-requirements)
- [Backend Requirements](#backend-requirements)
- [Data Processing Requirements](#data-processing-requirements)
- [Error Handling and Documentation](#error-handling-and-documentation)
- [Performance and Scalability](#performance-and-scalability)
- [SEO and Accessibility](#seo-and-accessibility)
- [Deployment Requirements](#deployment-requirements)
- [Technology Stack](#technology-stack)
- [Output Requirements](#output-requirements)

---

## Project Architecture

The project must follow a scalable and production-grade architecture with proper separation of concerns.

Architecture layers must include:

- Presentation Layer
- Component Layer
- Routing Layer
- Business Logic Layer
- API Layer
- Authentication Layer
- Validation Layer
- Database Layer
- AI and Analytics Layer
- Security Layer
- Deployment Layer

The architecture must ensure:

- UI logic remains isolated from backend logic
- Validation remains separate from controllers
- APIs remain separated from UI components
- Database logic remains isolated
- Authentication remains modular
- Security logic remains reusable
- AI systems remain scalable

---

# Project Structure

Strictly follow this structure:

- app
- components
- data
- hooks
- lib
- prisma
- public
- styles
- types

Configuration and root files:

- README.md
- next.config.ts
- tailwind.config.ts
- package.json
- tsconfig.json

---

# Architecture Layer Responsibilities

## Presentation Layer

Responsible for:

- UI rendering
- Responsive layouts
- User interactions
- Animations
- Accessibility

Implemented inside:

- app
- components
- styles

---

## Routing Layer

Responsible for:

- Dynamic routing
- Nested routing
- Route guards
- Protected routes
- Navigation flow

Implemented inside:

- app

If MERN architecture is used, implement:

- React Router DOM
- Nested routing
- Dynamic routes
- Protected routes
- Route guards
- Lazy-loaded routes

---

## Component Layer

Responsible for:

- Reusable UI components
- Shared layouts
- Forms
- Cards
- Buttons
- Modals
- Loaders
- Dashboard widgets

Implemented inside:

- components

---

## Business Logic Layer

Responsible for:

- Authentication logic
- Validation logic
- SEO utilities
- Error handling
- API utilities
- Email services
- Helper functions

Implemented inside:

- lib

---

## Database Layer

Responsible for:

- Database schema management
- Query optimization
- ORM configuration
- Data modeling
- Database migrations

Implemented inside:

- prisma

---

## AI and Analytics Layer

Responsible for:

- AI recommendations
- Smart tagging
- Search optimization
- Analytics processing
- Data preprocessing

Implemented inside:

- lib/ai
- lib/analytics

---

## Security Layer

Responsible for:

- Input sanitization
- Validation middleware
- XSS protection
- CSRF protection
- Secure authentication
- Secure API handling

Implemented inside:

- lib/security.ts
- lib/auth.ts
- lib/validators.ts

---

## Deployment Layer

Responsible for:

- Docker deployment
- Environment handling
- Production optimization
- CI/CD workflows

Implemented using:

- Docker
- Vercel
- Netlify

---

# Routing and Pages

All routing and application pages must exist inside the app directory.

Include:

- Homepage
- Blog pages
- Dynamic blog routes
- Authentication pages
- Admin dashboard
- Contact page
- Category pages
- API routes
- Error pages

---

# UI and Animation Requirements

## Scroll-Based Storytelling

Use:

- Framer Motion
- Smooth page transitions
- Scroll-triggered animations
- Hover effects
- Fade-in animations
- Text reveal animations
- Parallax effects

Animations must:

- Use GPU-friendly properties
- Avoid layout thrashing
- Maintain smooth mobile performance

---

# Layout Requirements

The platform must include:

- Hero section
- Featured blogs section
- Categories section
- Blog detail page
- Newsletter section
- Contact section
- Responsive navbar
- Footer
- Admin dashboard

All reusable UI components must exist inside the components directory.

---

# Blog Management Requirements

Implement:

- Create blog posts
- Edit blog posts
- Delete blog posts
- Save drafts
- Publish/unpublish blogs
- Featured image uploads
- Category management
- Tag management
- Related blog recommendations
- Full-text search

Blog logic must exist inside:

- app/api
- lib
- prisma

---

# Authentication and Authorization

Implement:

- JWT Authentication
- NextAuth
- Session handling
- Password hashing
- Role-based authorization

Support:

- Login and registration
- Forgot password
- Email verification
- Protected admin routes

Authentication logic must exist inside:

- lib/auth.ts
- app/api/auth

---

# Contact System Requirements

The contact system must include:

- Contact form modal or page
- Validation handling
- Success and error responses
- Smooth modal animations

Contact form fields:

- Name
- Email
- Phone number
- Message

---

## Validation

Implement:

- Client-side validation
- API validation
- Required field validation
- Email validation
- Sanitization
- Type checking

Use:

- Zod
- Joi
- Yup

Validation logic must exist inside the validation layer.

---

# Backend Requirements

Implement secure APIs for:

- Authentication
- Blog CRUD
- Search
- AI recommendations
- Newsletter
- Contact forms
- File uploads

All APIs must:

- Return structured JSON responses
- Handle errors gracefully
- Sanitize all inputs
- Use proper HTTP status codes

Backend logic must exist inside the backend utility layer and API routes.

---

# Data Processing Requirements

If AI, analytics, or machine learning features are implemented, include:

- df.isnull() handling
- Missing value treatment
- Outlier detection
- Outlier handling
- Data normalization
- Feature engineering
- Data preprocessing pipelines

Data processing logic must exist inside the AI and analytics layer.

---

# Error Handling and Documentation

Implement enterprise-level error handling for:

- Validation failures
- API failures
- Database errors
- Upload failures
- Authentication failures
- Internal server errors

Use:

- Global error handlers
- Structured JSON responses
- Secure logging
- User-friendly messages

Documentation must include:

- Setup instructions
- Folder structure
- Environment configuration
- Deployment guide
- API documentation

---

# Performance and Scalability
Ensure:

- Fast loading speed
- Minimal layout shifts
- High Lighthouse scores

---

# SEO and Accessibility

Implement:

- SEO metadata
- Sitemap generation
- Open Graph support
- Structured data
- Accessibility optimization
- Semantic HTML

SEO logic must exist inside the SEO utility layer.

---

# Deployment Requirements

Deploy using:

- Docker
- Vercel
- Netlify

Use:

- MongoDB Atlas
- Cloudinary
- AWS S3

Deployment configuration must include:

- Docker setup
- Production environment configuration
- CI/CD readiness
- Secure deployment setup

---

# Technology Stack

## Frontend

### Next.js

Used for:

- App Router
- SSR and SSG
- API routes
- Dynamic routing
- SEO optimization

---

### React

Used for:

- Reusable UI components
- Dynamic rendering
- State management

---

### Tailwind CSS

Used for:

- Responsive styling
- Layout design
- Mobile-first UI

---

### Framer Motion

Used for:

- Storytelling animations
- Page transitions
- Hover effects
- Scroll animations

---

## Backend

### Node.js

Used for:

- Backend runtime
- API execution
- Server-side operations

---

### JWT Authentication

Used for:

- Secure authentication
- Protected routes
- Authorization

---

### NextAuth

Used for:

- Authentication handling
- Session management

---

### Nodemailer

Used for:

- Contact emails
- Newsletter notifications
- Verification emails

---

## Database

### MongoDB

Used for:

- Blogs
- Users
- Comments
- Analytics

---

### Prisma ORM

Used for:

- Database schema management
- Type-safe queries
- Database migrations

---

## Security

### Zod / Joi / Yup

Used for:

- Form validation
- API validation
- Request sanitization

---

# Output Requirements

The final application must include:

- Fully functional frontend
- Secure backend APIs
- AI-powered blog features
- Admin dashboard
- Markdown support
- Input validation
- Error handling
- Secure routing
- Database integration
- Docker deployment setup
- Production-ready architecture

The final project must be scalable, secure, modern, responsive, optimized, maintainable, and fully production-ready.
