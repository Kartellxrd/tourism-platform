# 🌍 Pula Tourism Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![Keycloak](https://img.shields.io/badge/Keycloak-24.0+-red)
![License](https://img.shields.io/badge/license-MIT-green)

**An AI-Powered Tourism Booking and Recommendation Platform for Botswana**

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [API Documentation](#api-documentation)

</div>

---

## 📖 Overview

Pula Tourism Platform is an intelligent web application that transforms how tourists discover and book attractions in Botswana. The platform leverages **Artificial Intelligence** to provide personalized recommendations, **location-based discovery**, **natural language booking assistance**, and **seamless payment integration**.

### Why Pula Tourism Platform?

| Problem | Solution |
|---------|----------|
| Tourists don't know what's near them | **Location-based discovery** with automatic distance calculation using Haversine formula |
| Generic recommendations don't work | **AI-powered personalization** using cosine similarity (0-100% match scores) |
| Booking requires multiple steps | **Natural language chat assistant** - just say "Book me a safari" |
| Limited payment options | **5 payment methods** including local mobile money (Orange Money, MyZaka, Smega) |
| No centralized management | **Complete admin panel** with real-time analytics and CRUD operations |

---

## ✨ Features

### For Tourists 👤

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Secure login/register via Keycloak OAuth 2.0 |
| 📍 **Location Discovery** | Find attractions within 5-50km radius with live distance calculation |
| 🤖 **AI Recommendations** | Personalized match scores (0-100%) based on your preferences |
| 💬 **Pula AI Chat** | Natural language assistant - "Book me a safari this weekend" |
| 📅 **Booking System** | Select dates, guests, vehicles, get QR code for entry |
| 💳 **5 Payment Methods** | Card (Stripe), Orange Money, MyZaka, Smega, FNB Transfer |
| ❤️ **Wishlist** | Save destinations for later |
| 🦁 **Wildlife Calendar** | 12-month predictive ratings (1-10 scale) |
| 🗺️ **Itinerary Planner** | AI-generated 1-7 day trip plans with budget options |
| 📊 **Personal Analytics** | Track your travel stats and spending |

### For Administrators 👑

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Real-time stats: users, bookings, revenue, pending approvals |
| 🏝️ **Destination Management** | Add/Edit/Delete attractions with auto-fetch coordinates |
| 📋 **Booking Management** | View, confirm, cancel all bookings |
| 👥 **User Management** | View registered users |
| 📈 **Analytics Charts** | Revenue trends, popular destinations |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | React framework with App Router |
| React | 18.2 | UI components |
| Tailwind CSS | 3.4 | Styling and responsive design |
| Framer Motion | 10.16 | Animations |
| React Icons | 5.0 | Icon library |
| Google Maps API | - | Interactive maps and geocoding |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.115+ | RESTful API framework |
| Python | 3.14 | Programming language |
| SQLAlchemy | 2.0 | ORM for database operations |
| scikit-learn | 1.5 | Cosine similarity for AI recommendations |
| Uvicorn | 0.30 | ASGI server |

### Database & Authentication
| Technology | Version | Purpose |
|------------|---------|---------|
| MySQL | 8.0 | Relational database |
| Keycloak | 24.0 | OAuth 2.0 authentication |

### External APIs
| API | Purpose |
|-----|---------|
| Google Maps API | Maps, geocoding, places |
| Stripe | Credit/debit card payments (test mode) |
| OpenWeatherMap | Real-time weather data |
| QR Server | QR code generation |

---

## 🚀 Installation Guide

### Prerequisites

| Software | Version | Check Installation |
|----------|---------|---------------------|
| Node.js | 18.x or higher | `node --version` |
| Python | 3.14 or higher | `python --version` |
| MySQL | 8.0 or higher | `mysql --version` |
| Docker | 20.x or higher | `docker --version` |
| Git | 2.40 or higher | `git --version` |

### Step 1: Clone the Repository

```bash
git clone https://github.com/Kartellxrd/tourism-platform.git
cd tourism-platform
