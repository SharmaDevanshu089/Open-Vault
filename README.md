# 🔐 Open Vault

**A Native-First Password Manager for Windows**

[![Made with Rust](https://img.shields.io/badge/Rust-🦀-orange?style=flat&logo=rust)](https://www.rust-lang.org/) [web:9]  
[![Tauri](https://img.shields.io/badge/Tauri-App-blue?style=flat&logo=tauri)](https://tauri.app/) [web:5]  
[![SvelteKit](https://img.shields.io/badge/SvelteKit-frontend-ff3e00?style=flat&logo=svelte)](https://kit.svelte.dev/) [web:9]  
[![License](https://img.shields.io/badge/license-MIT-green?style=flat)](#-license) [web:9]

---

## 📖 Overview

**Open Vault** is a desktop application built to feel *native* — not like a web app running inside a browser shell. It delivers a true Windows desktop experience while maintaining enterprise-grade security by integrating directly with the operating system. [web:5]

Instead of reinventing storage, Open Vault uses the **Windows Credential Manager (OS Keyring)** for secret management, leveraging built-in encryption and authentication. The app uses **Tauri** to ship a lightweight, secure executable that integrates deeply with the Windows ecosystem. [web:5]

This project highlights **Systems Programming**, **Secure Architecture**, and **Modern UI Engineering**, combining Rust, SvelteKit, and Fluent-inspired design. [web:7]

---

## 🎨 Key Features

- **🔗 Native Windows Integration**  
  - Designed specifically for Windows with support for **Mica** and **Acrylic** window effects that adapt to your desktop wallpaper.

- **🗝 Zero-Database Architecture**  
  - No local SQLite or JSON password stores; secrets live in the Windows OS Keyring via Credential Manager.

- **🦀 Memory-Safe Backend**  
  - Backend implemented in **Rust**, providing memory safety, thread safety, and strong type guarantees.

- **⚡ Fluid User Experience**  
  - Frontend powered by **SvelteKit + TailwindCSS**, delivering responsive interactions and smooth animations consistent with Windows 11 design principles.

---

## ⚙️ Technical Specifications

### 🧩 Architecture

Open Vault uses Tauri’s multi-process model with a clear separation of concerns. [web:5]

| Component         | Stack                       | Responsibilities                                                |
|------------------|-----------------------------|-----------------------------------------------------------------|
| **Core (Backend)** | Rust + Tauri                | System calls, window management, secure Windows API bridge      |
| **Secure Storage** | Rust + `keyring` crate      | Read/write credentials using Windows Credential Manager         |
| **UI (Frontend)**  | SvelteKit + TypeScript      | Views, routing, 60FPS interactions, state handling              |
| **Styling**        | TailwindCSS                 | Fluent-inspired design, layout, and theming                     |
| **State**          | Svelte Stores               | Application state and reactive data flow                        |

Key backend crates: `tauri`, `keyring`, `serde`. [web:17]

### 🔒 Security Model

- **Storage**  
  Credentials are stored as generic credentials in **Windows Credential Manager**, letting the OS handle secure persistence. [web:11]

- **Encryption**  
  Encryption and decryption are handled by **DPAPI**, tied to the user’s Windows account, avoiding custom cryptography. [web:11]

- **IPC Security**  
  Communication between the Rust backend and WebView is strictly typed and scoped through Tauri’s IPC bridge, minimizing attack surface area. [web:5]

---

## 🚀 Getting Started

### Prerequisites

Install the following before setting up the project:

- [Rust (latest stable)](https://www.rust-lang.org/tools/install) [web:7]  
- [Node.js (LTS) & npm](https://nodejs.org/) [web:7]  
- [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (required for Tauri on Windows) [web:11]

### 🏗 Installation

```


# Clone the repository

git clone https://github.com/sharmadevanshu089/open-vault.git
cd open-vault

# Install frontend dependencies

npm install

```

### 💻 Development Mode

Run the app with hot-module reloading for both backend and frontend:

```

npm run tauri dev

```

### 📦 Build for Production

Create an optimized installer and executable in `src-tauri/target/release`:

```

npm run tauri build

```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. [web:10]

- Open an issue to discuss bugs, UX ideas, or new features.  
- Submit a pull request with clear descriptions and small, focused changes.  

Before contributing, ensure your changes build successfully using the Tauri pipeline and basic project scripts. [web:5]

---

## 📸 Screenshots

> *Coming soon*  
> Add screenshots showcasing:
> - The main vault list view  
> - Mica/Acrylic background effect  
> - Add / edit credential flows  

---

## 👨‍💻 Author

**Devanshu Sharma**  
Developer focused on high-performance, secure applications that blend systems-level engineering with modern UX.

- 🌐 Portfolio / Resume: https://sharmadevanshu089.github.io/  
- 💻 GitHub: https://github.com/sharmadevanshu089  

---

## 📜 License

This project is licensed under the **MIT License**.  
You are free to use, modify, and distribute the software under the terms of the license, while respecting all applicable copyrights and intellectual property. 
```