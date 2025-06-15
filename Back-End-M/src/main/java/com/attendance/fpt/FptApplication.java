package com.attendance.fpt;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class 	FptApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
				.filename("local.env")
				.ignoreIfMissing()
				.load();

		System.setProperty("SPRING_APPLICATION_NAME", dotenv.get("SPRING_APPLICATION_NAME", "fpt"));
		System.setProperty("API_PREFIX", dotenv.get("API_PREFIX", "api/v1"));

		System.setProperty("SPRING_DATASOURCE_URL", dotenv.get("SPRING_DATASOURCE_URL"));
		System.setProperty("SPRING_DATASOURCE_USERNAME", dotenv.get("SPRING_DATASOURCE_USERNAME"));
		System.setProperty("SPRING_DATASOURCE_PASSWORD", dotenv.get("SPRING_DATASOURCE_PASSWORD"));
		System.setProperty("SPRING_DATASOURCE_DRIVER_CLASS_NAME", dotenv.get("SPRING_DATASOURCE_DRIVER_CLASS_NAME"));

		System.setProperty("SPRING_JPA_HIBERNATE_DDL_AUTO", dotenv.get("SPRING_JPA_HIBERNATE_DDL_AUTO"));
		System.setProperty("SPRING_JPA_SHOW_SQL", dotenv.get("SPRING_JPA_SHOW_SQL"));
		System.setProperty("SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT", dotenv.get("SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT"));
		System.setProperty("SPRING_JPA_PROPERTIES_HIBERNATE_ENABLE_LAZY_LOAD_NO_TRANS", dotenv.get("SPRING_JPA_PROPERTIES_HIBERNATE_ENABLE_LAZY_LOAD_NO_TRANS"));

		System.setProperty("SPRING_MAIL_HOST", dotenv.get("SPRING_MAIL_HOST"));
		System.setProperty("SPRING_MAIL_USERNAME", dotenv.get("SPRING_MAIL_USERNAME"));
		System.setProperty("SPRING_MAIL_PASSWORD", dotenv.get("SPRING_MAIL_PASSWORD"));
		System.setProperty("SPRING_MAIL_PORT", dotenv.get("SPRING_MAIL_PORT"));
		System.setProperty("SPRING_MAIL_PROPERTIES_MAIL_TRANSPORT_PROTOCOL", dotenv.get("SPRING_MAIL_PROPERTIES_MAIL_TRANSPORT_PROTOCOL"));
		System.setProperty("SPRING_MAIL_PROPERTIES_MAIL_SMTP_PORT", dotenv.get("SPRING_MAIL_PROPERTIES_MAIL_SMTP_PORT"));
		System.setProperty("SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH", dotenv.get("SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH"));
		System.setProperty("SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE", dotenv.get("SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE"));
		System.setProperty("SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_REQUIRED", dotenv.get("SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_REQUIRED"));

		System.setProperty("SPRING_APP_JWT_ACCESS_SECRET", dotenv.get("SPRING_APP_JWT_ACCESS_SECRET"));
		System.setProperty("SPRING_APP_JWT_ACCESS_EXPIRATION_MS", dotenv.get("SPRING_APP_JWT_ACCESS_EXPIRATION_MS"));
		System.setProperty("SPRING_APP_JWT_REFRESH_SECRET", dotenv.get("SPRING_APP_JWT_REFRESH_SECRET"));
		System.setProperty("SPRING_APP_JWT_REFRESH_EXPIRATION_MS", dotenv.get("SPRING_APP_JWT_REFRESH_EXPIRATION_MS"));


		System.setProperty("LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY", dotenv.get("LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY"));
		SpringApplication.run(FptApplication.class, args);
	}

}
