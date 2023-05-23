
# Data

## Data Storage 

Die Genetix Webapp speichert Daten in einer PostgreSQL-Datenbank. Das Datenbankschema ist so konzipiert, dass es die verschiedenen von der Anwendung benötigten Datenentitäten unterstützt, einschließlich Registrierungscodes, Benutzer, Teams und Teamtypen.

## Data Models 

Die von der Genetix-Webapp verwendeten Datenmodelle werden mit einem objektrelationalen Mapping-Tool (ORM) wie Sequelize definiert. Die Modelle werden im Verzeichnis server/models definiert und folgen den folgenden Konventionen:

* Jedes Modell wird in einer separaten Datei definiert.
* Die Modelldatei exportiert eine Sequelize-Modellinstanz.
* Die Modelldefinition enthält Felder für jedes Datenattribut, einschließlich Datentypen, Beschränkungen und Standardwerte.
* Die Modelldefinition enthält Beziehungen zu anderen Modellen unter Verwendung von Sequelize-Assoziationen.

## Data Access 

Der Datenzugriff in der Genetix-Webapp erfolgt über eine Datenzugriffsschicht (DAL), die für die Kommunikation mit der Datenbank zuständig ist und eine API für andere Anwendungskomponenten zur Interaktion mit den Daten bereitstellt. Die DAL ist mit Sequelize implementiert und wird im Verzeichnis server/dal definiert.

Die DAL bietet eine Reihe von Methoden für jede Datenentität, einschließlich CRUD-Operationen (create, read, update, delete) und andere entitätsspezifische Operationen. Beispielsweise bietet die Entität RegistrationCode Methoden zum Erstellen neuer Codes, zum Deaktivieren gültiger Codes und zum Reaktivieren abgelaufener Codes.

## Data Migration 

Wenn Änderungen am Datenbankschema oder an den Datenmodellen vorgenommen werden, ist eine Datenmigration erforderlich, um sicherzustellen, dass die vorhandenen Daten an das neue Schema angepasst werden. Die Datenmigration wird mit einem Tool wie Sequelize-Migrationen durchgeführt, das schrittweise Änderungen des Datenbankschemas im Laufe der Zeit ermöglicht.

Die Migrationen werden im Verzeichnis server/migrations definiert und sind für jede Migration in separaten Dateien organisiert. Jede Migrationsdatei enthält eine Beschreibung der durchzuführenden Änderungen sowie die Änderungen selbst unter Verwendung der Sequelize-Methoden zur Änderung des Datenbankschemas.

## Data Validation 

Die Datenvalidierung in der Genetix-Webapp erfolgt über eine Validierungsschicht, die dafür sorgt, dass die Daten konsistent sind und dem erwarteten Format entsprechen. Die Validierung wird sowohl auf der Client-Seite mit JavaScript als auch auf der Server-Seite mit Sequelize-Validierungsmethoden durchgeführt.

Die Validierungsregeln werden in den Datenmodellen selbst definiert, wobei Sequelize-Validierungsmethoden verwendet werden. Das Benutzermodell enthält beispielsweise Validierungsregeln, um sicherzustellen, dass die E-Mail-Adresse eindeutig ist und das Passwort die Mindestkomplexitätsanforderungen erfüllt.

## Data Backup and Recovery 

Um sicherzustellen, dass die Daten gesichert und im Falle einer Katastrophe oder eines Datenverlusts wiederherstellbar sind, implementiert die Genetix Webapp einen Sicherungs- und Wiederherstellungsprozess. Dieser Prozess umfasst regelmäßige Sicherungen der Datenbank, die auf einem separaten Speichermedium oder in der Cloud gespeichert werden, sowie einen Wiederherstellungsprozess im Falle eines Datenverlusts.

Der Sicherungsprozess wird mit einem Tool wie mysqldump durchgeführt, das eine Sicherungsdatei mit einem Schnappschuss der Datenbank erstellt. Der Wiederherstellungsprozess umfasst die Wiederherstellung der Sicherungsdatei in einer neuen Datenbankinstanz und die anschließende Aktualisierung der Anwendungskonfiguration, um auf die neue Datenbank zu verweisen.

## Data Privacy and Security 

Datenschutz und Sicherheit sind für die Genetix-Webanwendung von entscheidender Bedeutung, da sie sensible Daten wie Benutzer- und Teaminformationen enthält. Um den Datenschutz und die Sicherheit zu gewährleisten, befolgt die Anwendung die folgenden Best Practices:

* Verschlüsselung: Sensible Daten wie Passwörter und Registrierungscodes werden in der Datenbank verschlüsselt gespeichert, wobei ein sicherer Algorithmus wie bcrypt verwendet wird.

* Authentifizierung und Autorisierung: Die Benutzer müssen sich bei der Anwendung mit ihrer E-Mail-Adresse und ihrem Kennwort authentifizieren und sind je nach ihrer Rolle (z. B. Administrator oder Teammitglied) berechtigt, bestimmte Aktionen durchzuführen.
