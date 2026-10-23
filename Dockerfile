# Stage 1: Build the Spring Boot application
FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend ./backend
WORKDIR /app/backend
RUN mvn clean package -DskipTests

# Stage 2: Minimal runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/backend/target/fittrack-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
