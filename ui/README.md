# Decentraland Trust UI

The **Decentraland Trust UI** is a front-end interface designed to display the Decentraland Trust system, enabling seamless participation in governance and reputation management within the Decentraland community. This UI can run independently or with the Decentraland Trust server, providing flexibility in development and deployment.

---

## Features

- **User Interface**: Intuitive design for interacting with reputation management and governance tools.
- **Standalone Operation**: Can run independently or alongside the backend server.

---

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)  
- [npm](https://www.npmjs.com/get-npm)  
- [Docker](https://www.docker.com/get-started) (for containerized setup)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/metaverseunknower/dcl-trust.git
cd dcl-trust/ui
```

### 2. Install Dependencies

In the `ui` directory, install the required packages:

```bash
npm install
```

---

## Development Setup

### Run the UI Locally

To start the UI in development mode, run:

```bash
npm run dev
```

The UI will be available at `http://localhost:23456` (or another port if specified).

---

## Configuration

The UI requires environment variables stored in a `.env` file. Use the `.env.example` as a starting point.

Example `.env` for UI:

```bash
NODE_ENV=development
VITE_PORT=23456
VITE_API_BASE_URL=http://localhost:34567
VITE_WSS_BASE_URL=ws://localhost:34567
```

---

## Contributing

Contributions are welcome! Please feel free to submit issues, pull requests, or ideas for improvements. Ensure you follow the code of conduct.

---

## License

This project is licensed under the **GPL-2.0 license**.

---

## Contact

For questions or feedback, reach out to the project maintainers:

- **Discord**: unknower  
- **Email**: dev[at]unknower[dot]com  

---

## Acknowledgments

Special thanks to the Decentraland community and contributors to the Decentraland DAO for their continued support and feedback.
