# Administration

Im Folgenden werden die Hauptanwendungsfälle aus Sicht der Administration dargelegt:

## Registrierungscodes verwalten

Es soll möglich sein, neue Registrierungscodes zu erstellen, abgelaufene Codes zu reaktivieren und gültige Codes zu deaktivieren. Beim Erstellen eines neuen Codes sollte auch ausgewählt werden können, welche Rolle dem neuen Benutzer nach der Registrierung zugewiesen wird. Mithilfe dieses generierten Codes kann sich ein neuer Benutzer innerhalb der nächsten 24 Stunden in der Webapp registrieren.

## Benutzerverwaltung

Es soll möglich sein, alle Benutzerdaten zu bearbeiten, das Passwort zurückzusetzen und Benutzer zu sperren sowie zu entsperren. Die Benutzer sollten in einer tabellarischen Ansicht dargestellt werden.

## Teamverwaltung

Es soll möglich sein, neue Teams anzulegen und bestehende Teams zu bearbeiten oder zu löschen. Ein Team sollte mindestens einen einmaligen Namen haben und einem Team-Typ zugeordnet werden können.

## Team-Typenverwaltung

Es soll möglich sein, neue Team-Typen zu erstellen und bestehende zu bearbeiten. Das Löschen von Teamtypen sollte jedoch nicht in der Webapp selbst möglich sein.

# Mitglieder

Im Folgenden werden die Hauptanwendungsfälle aus Sicht der Mitglieder aufgeführt:

## Berechtigungen

Jedes Mitglied kann beliebig vielen Teams angehören. Die Team-Typen, denen diese Teams zugeordnet sind, definieren die Berechtigungen des einzelnen Benutzers. Die Berechtigungen definieren welche Seiten zugänglich sind.

## Registrierung

Ein neues Benutzerkonto muss zuerst von einem Benutzer erstellt werden, welcher Administrationsrechte besitzt. Anschliessend kann der neue Benutzer sich zum ersten Mal Registrieren.

Bei der Registrierung sollten verschiedene Daten vom Benutzer eingegeben werden können, einschliesslich Wohnort, Name und Alter. Die Registrierung sollte nur mithilfe eines einmaligen Registrierungscodes möglich sein, der 24 Stunden lang gültig ist.

## Anmeldung

Jedes Vereinsmitglied sollte sich über eine Anmeldeseite anmelden können. Das Mitglied sollte sein Passwort im Maximum 5-mal falsch eingeben können, bevor der Benutzer gesperrt wird. Es sollte auch die Möglichkeit geben, das Passwort über die hinterlegte E-Mail-Adresse zurückzusetzen.

## Dashboard

Das Dashboard sollte die Startseite für jedes Vereinsmitglied sein. Hier sollten aktuelle Informationen, Links zu Social-Media-Kanälen sowie die nächsten anstehenden Termine oder Events angezeigt werden.

## Kalender

Das Ziel des Kalenders ist es, dass Teams interne Trainingstermine finden können. Es sollte möglich sein, Zeitbereiche, Abwesenheiten, Unklarheiten oder Verfügbarkeiten für jeden Tag zu konfigurieren. Es sollte auch möglich sein, Termine beliebig weit in die Zukunft einzugeben. Eine Tabelle sollte auch auf der Grundlage der eingegebenen Kalenderdaten eine Liste der nächsten anstehenden Trainings generieren können. Dabei sollte die Konfiguration möglich sein, ab wie vielen Teilnehmern das Training stattfindet.
## Settings

Die Einstellungs-Seite soll der Verwaltung des eigenen Benutzers dienen. Folgende Features soll diese Seite beinhalten:

* Hochladen eines Profilbildes
* Ändern der Accountdaten
* Ändern des Passwortes
* Löschen des Benutzers
* Eingabe von Personenbezogenen Informationen

## Zeichnungsfläche

Die Zeichnungsfläche ermöglicht es im Browser Team Taktiken zu besprechen. Es soll möglich sein, eigene Bilder hochzuladen, welche dann beschrieben werden können. Abspeichern, laden sowie herunterladen von Zeichnungen soll ebenfalls möglich sein.

## Datenablage

Auf der Datenablage soll man Dokumente herunterladen bzw. hochladen können. Das Hochladen soll jedoch in einer ersten Version den Administratoren vorbehalten sein. Somit dient sie anfangs als Downloadportal für Vereinsressourcen.

# Weitere Anforderungen

Da diese Webapplikation möglichst modular aufgebaut werden soll, dient sie als Plattform für viele weitere Projekte oder Feature-Erweiterungen.

Im Folgenden werden einige bereits angedachte Erweiterungen erläutert:

## Statistik Seiten

Es sollen für verschiedene Teams Statistikseiten erstellt werden. Dabei sollen die Informationen des jeweiligen Spiels via API in die Web-App geladen werden, wo diese dann veranschaulicht werden. Die Game-Accounts sollen beim Benutzer verlinkt werden.

## Onlineshop

Es soll einen Onlineshop geben, in welchem Mitglieder und gegebenenfalls auch Gäste einzelne gebrandete Fan-Artikel kaufen können. In einer ersten Phase sollen die Zahlungen sowie die Bestellungen beim Lieferanten manuell von der Vereinsadministration getätigt werden. Falls gewünscht könnten diese Teile in der Zukunft automatisiert werden.

## Fileshare – Version 2.0

Der Fileshare soll um ein vollumfängliches Berechtigungssystem erweitert werden. Damit können einzelne Mitglieder Daten hochladen und via Link freigeben. Ebenfalls sollen die einzelnen Teams einen privaten Ordner erhalten, worin sie Dateien teilen können.



\
\
\
Für die Genetix Webapp sind die Ziele auf der einen Seite technischer Natur, da die Software bestimmte Funktionen bereitstellen soll, um die Verwaltung von Registrierungscodes, Benutzern, Teams und Mitgliedern zu ermöglichen. Auf der anderen Seite sind die Ziele auch wirtschaftlicher Natur, da die Software an andere Vereine lizenziert werden kann und somit ein Einkommen generieren kann. Ein Erfolg für die Genetix Webapp wäre erreicht, wenn die Software effektiv die Verwaltungsaufgaben erleichtert und von den Vereinsmitgliedern und Teams angenommen wird. Zudem wäre es ein Erfolg, wenn die Software erfolgreich an andere Vereine lizenziert wird und somit ein zusätzliches Einkommen für den Entwickler generiert wird. 