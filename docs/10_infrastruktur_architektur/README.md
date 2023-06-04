
# Infrastructure Architecture

## Einführung 

Die Genetix Webapp ist eine cloudbasierte Webanwendung, die auf einer skalierbaren, fehlertoleranten Infrastruktur läuft. Die Infrastruktur ist so konzipiert, dass sie die erwartete Last der Anwendung unterstützt und eine hohe Verfügbarkeit und Zuverlässigkeit gewährleistet.

## Architektur Überblick

Die Infrastrukturarchitektur der Genetix-Webapp besteht aus mehreren Komponenten, darunter:

* Webserver: Der Webserver ist für die Bearbeitung von Webanfragen an Clients zuständig und wird mit einem Webserver wie Nginx oder Apache implementiert.
* Anwendungsserver: Der Anwendungsserver ist für die Ausführung des Node.js-Anwendungscodes zuständig und wird mit einem Prozessmanager wie PM2 implementiert.
* Datenbank-Server: Der Datenbankserver ist für das Speichern und Abrufen von Daten zuständig und wird mit einer PostgreSQL-Datenbank implementiert.
* Load Balancer: Der Load Balancer ist für die Verteilung von Webanfragen auf mehrere Webserver-Instanzen zuständig und wird mit einem Load Balancing-Dienst wie Amazon Elastic Load Balancer oder Google Cloud Load Balancing implementiert.
* Content Delivery Network (CDN): Das CDN ist für die Zwischenspeicherung statischer Elemente wie Bilder, CSS- und JavaScript-Dateien zuständig und wird mit einem CDN-Dienst wie Amazon CloudFront oder Google Cloud CDN implementiert.

## Hohe Verfügbarkeit und Skalierbarkeit

Die Infrastruktur-Architektur der Genetix Webapp ist so konzipiert, dass sie hohe Verfügbarkeit und Skalierbarkeit unterstützt. Dies wird durch die folgenden Mechanismen erreicht:

* Load Balancing: Webanfragen werden auf mehrere Webserver-Instanzen verteilt, um sicherzustellen, dass kein einzelner Server überlastet wird.

* Automatische Skalierung: Webserver-Instanzen können mit Hilfe eines automatischen Skalierungsdienstes wie Amazon EC2 Auto Scaling oder Google Cloud Auto Scaling automatisch nach oben oder unten skaliert werden, je nach Bedarf.

* Datenbank-Replikation: Der Datenbankserver verwendet die Master-Slave-Replikation, um sicherzustellen, dass die Daten über mehrere Datenbankinstanzen hinweg repliziert werden, was eine hohe Verfügbarkeit und Zuverlässigkeit gewährleistet.

* CDN-Caching: Statische Elemente wie Bilder und CSS-Dateien werden im CDN zwischengespeichert, wodurch die Last auf dem Webserver verringert und die Leistung verbessert wird.

## Security und Compliance 

Die Infrastruktur-Architektur der Genetix Webapp ist so konzipiert, dass die Sicherheit und die Einhaltung der besten Praktiken und Standards der Branche gewährleistet sind. Dies wird durch die folgenden Mechanismen erreicht:

* Netzwerksicherheit: Die Infrastruktur ist durch Firewalls, Netzwerk-ACLs und Sicherheitsgruppen geschützt, die den Zugriff auf die Infrastruktur auf autorisierte Parteien beschränken.

* Verschlüsselung: Alle zwischen den Clients und dem Webserver übertragenen Daten werden über HTTPS verschlüsselt, und sensible Daten wie Kennwörter und Registrierungscodes werden in der Datenbank verschlüsselt gespeichert.

* Compliance: Die Infrastruktur ist so konzipiert, dass sie Industriestandards und Vorschriften wie die General Data Protection Regulation (GDPR) und den Payment Card Industry Data Security Standard (PCI DSS) einhält.

## Monitoring und Logging 

Die Infrastrukturarchitektur der Genetix-Webapp ist so konzipiert, dass sie die Überwachung und Protokollierung unterstützt und so eine proaktive Identifizierung von Problemen und die Fehlerbehebung ermöglicht. Dies wird durch die folgenden Mechanismen erreicht:

* Anwendungsüberwachung: Der Anwendungsserver wird mit einem Tool wie PM2 überwacht, das in Echtzeit Metriken über die Leistung und Verfügbarkeit der Anwendung liefert.

* Server-Überwachung: Die Web- und Datenbankserver werden mit einem Tool wie Amazon CloudWatch oder Google Cloud Monitoring überwacht, das Echtzeitmetriken zur Serverleistung und -verfügbarkeit liefert.

* Protokollierung: Anwendungs- und Serverprotokolle werden mit einem Tool wie Amazon CloudWatch Logs oder Google Cloud Logging gesammelt und gespeichert, was die Fehlersuche und -behebung bei Problemen ermöglicht.

## Netzwerkplan
![Component](picture/Netzwerkplan.png)


