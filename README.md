# Marketplace Frontend – Search & Product Example

This folder demonstrates a modern, production-grade implementation of a search and product listing experience for an e-commerce marketplace, built with **Next.js**, **TypeScript**, **React**, **elasticSearch** and **Zustand**.

## Features

- **Full-text Search**  
  Users can search products by name, brand, or keywords, with support for both Cyrillic and Latin scripts (optimized for Mongolian user base).
- **Real-time Stock Updates**  
  Live WebSocket integration ensures product stock levels are always up to date.
- **Filtering & Sorting**  
  Enables sorting and filtering across multiple criteria with fast and responsive UI updates.
- **Search History & Recently Viewed**  
  Tracks and displays recent search queries and seen items, enhancing user flow.
- **Performance Optimizations**  
  Built-in memoization, throttling, and scoped state for fast response and smooth performance on both desktop and mobile.

## Why is this important?

- **Real-world Complexity**  
  Demonstrates the handling of complex UI states, async data, and real-time syncing in a scalable and maintainable architecture.
- **Best Practices**  
  Utilizes Next.js routing, functional components, Zustand for global state, and strict TypeScript typing.
- **Production-Ready Code**  
  Extracted from a larger live application used in production at a telecom-backed e-commerce platform.

## Technologies

- [Next.js]
- [React]
- [Zustand]
- [Socket.io-client]
- [Tailwind CSS]
- [Lodash]
- [ElasticSearch]:  
  Used as the primary search engine for products. ElasticSearch enables fast, full-text, and faceted search, supporting features like typo-      tolerance, relevance ranking, and instant suggestions. The `CAT_API.search` endpoint connects directly to ElasticSearch, providing users       with real-time, highly relevant search results—something that would be difficult and slow with a traditional relational database.

## Folder Structure

/search/[field]/[item]/page.tsx -> Dynamic Product Results
/searched/page.tsx -> Recently Searched
/seen/page.tsx -> Recently Viewed
layout.tsx -> Layout Wrapper
page.tsx -> Main Search Landing
searchStore.ts -> Zustand Store
---

This example is a small showcase of my larger full-stack work involving real-time commerce, containerized backend (Docker/Kubernetes), and multi-database integration (PostgreSQL, MongoDB, ElasticSearch, Redis).

