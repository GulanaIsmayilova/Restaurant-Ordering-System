## Frontend Installation & Run

```bash
cd frontend
npm install
npm start
```

## Backend Installation & Run

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

## Requirements

- Java 17  
- MySQL (Database credentials must be updated in `application.properties`)
- Redis must be installed  
- RabbitMQ must be installed  

## Sample Data

Sample users are preloaded in the backend project.  
You can view the data in the `DataInitializer` class and log in using the following credentials:

| Username  | Password   |
|-----------|------------|
| admin     | admin123   |
| waiter1   | waiter123  |
| kitchen1  | kitchen123 |
