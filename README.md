# Marketplace Frontend – Search & Product Example

This folder demonstrates a modern, production-grade implementation of a search and product listing experience for an e-commerce marketplace, built with **Next.js**, **React**, and **Zustand**.

## Features

- **Full-text Search:**  
  Users can search for products by name, brand, or keywords, with support for both Cyrillic and Latin scripts (Mongolians use cyrillic).
- **Real-time Stock Updates:**  
  Product stock is updated in real time using WebSocket events, ensuring users always see the latest availability.
- **Filtering & Sorting:**  
  Users can filter and sort search results by various criteria, with fast, responsive UI updates.
- **Recent Searches & History:**  
  The app tracks and displays recent search queries and recently viewed products for quick access.
- **Performance Optimizations:**  
  Uses memoization, throttling, and efficient state management for a smooth user experience and mobile-friendly layouts.

## Why is this important?

- **Real-world Complexity:**  
  This codebase demonstrates how to handle complex UI state, real-time data, and user interactions in a scalable way.
- **Modern Best Practices:**  
  Uses hooks, functional components, modular state management, and clean separation of concerns.
- **Recruiter Value:**  
  Shows ability to build interactive, maintainable, and performant web applications with modern tools.

## Technologies Used

## Technologies Used

- [Next.js]
- [React]
- [Zustand]
- [Socket.io-client]
- [Tailwind CSS]
- [Lodash]
- [ElasticSearch]:  
  Used as the primary search engine for products. ElasticSearch enables fast, full-text, and faceted search, supporting features like typo-      tolerance, relevance ranking, and instant suggestions. The `CAT_API.search` endpoint connects directly to ElasticSearch, providing users       with real-time, highly relevant search results—something that would be difficult and slow with a traditional relational database.

## How it works

- **Search:**  
  The user types a query, which is processed and sent to the backend. Results are displayed with highlights and suggestions.
- **Real-time Stock:**  
  The frontend listens for stock_update events and updates product stock instantly.
- **History:**  
  Recent searches and seen products are stored and displayed for convenience.

This folder is an example of my ability to build robust, user-friendly, and real-time web applications using modern frontend technologies.
