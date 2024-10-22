# Decentraland Trust

**Decentraland Trust** is a decentralized system for rewarding contributing members of the Decentraland community with digital Karma points. The project offers a user interface (UI) and server that can run independently or together to facilitate smooth interaction between participants and reputation management systems.

---

## Features

- **Reputation Management**: Track and manage user contributions within the Decentraland community.
- **Modular Architecture**: UI and server operate independently or together as a seamless system.
- **Docker Support**: Simplified deployment with `docker-compose` for production environments.

---

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/get-npm)
- [Docker](https://www.docker.com/get-started) (for containerized setup)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/metaverseunknower/dcl-trust.git
cd dcl-trust
```

### 2. Install Dependencies

Navigate to both the UI and server directories and install dependencies using npm:

```bash
# For UI
cd ui
npm install

# Return to root directory
cd ..

# For Server 
cd server
npm install
```

---

## Development Setup

### Run UI and Server Separately

To run the UI and server independently for development, use:

```bash
# In UI directory
npm run dev

# In Server directory
npm run dev
```

The UI will be available at `http://localhost:23456` (or specified port), and the server will be accessible at `http://localhost:34567`.

---

## Docker Setup

You can also run the entire project using `docker-compose` for an easy deployment.

### 1. Build and Run the Containers

In the project’s root directory, run:

```bash
docker-compose up --build
```

This command will build and start both the UI and server services.

### 2. Access the Application

- **UI**: [http://localhost:23456](http://localhost:23456)
- **Server**: [http://localhost:34567](http://localhost:34567)

### 3. Stop the Containers

To stop the containers, use:

```bash
docker-compose down
```

---

## Configuration

Both the UI and server use `.env` files for configuration. Make sure to create these files with the required environment variables. You can use the provided `.env.example` files as a reference.

```bash
# Example usage in .env (Server)
NODE_ENV=development
PORT=34567
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIABCDEFGHIJKLMNOP
AWS_SECRET_ACCESS_KEY=kWeLlIguEssThIsIsSupp0s3dToB3AS3CR3T101
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/12345678901234/TH1Sh3R3iSy0URwEBHOOKuRL1Fy0UwANTtOgETaLERTSt0aDISCORDcHANNEL
JWT_SECRET_KEY=12345678912345678234567893456789345678USESOMETHINGELSEBESIDESTHISPLEASE
JWT_REFRESH_SECRET_KEY=123456789009876543212345678909876543NOREALLYDONOTUSETHIS
CLIENT_ORIGIN=http://localhost:23456
```

---

## Contributing

Contributions are welcome! Feel free to submit issues, pull requests, or feature requests. Make sure to follow the code of conduct.

---

## License

This project is licensed under the **GPL-2.0 license**.

---

## Contact

For questions, feedback, or suggestions, contact the project maintainers at:

- **Discord**: unknower
- **Email** dev[at]unknower[dot]com

---

## Acknowledgments

Special thanks to the Decentraland community and various contributors to the Decentraland DAO for their support and feedback throughout the project.
