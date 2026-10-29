FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml ./
RUN mvn -B -ntp -DskipTests dependency:go-offline
COPY src/ ./src/
# The container uses its own config; local credentials never enter the image.
COPY deployment/application.properties ./src/main/resources/application.properties
RUN mvn -B -ntp -Dmaven.test.skip=true package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN groupadd --system lys && useradd --system --gid lys --home-dir /app lys
COPY --from=build --chown=lys:lys /build/target/Backend-0.0.1-SNAPSHOT.jar ./app.jar
USER lys
ENV PORT=10000
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=65.0 -XX:+ExitOnOutOfMemoryError -Dfile.encoding=UTF-8"
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
