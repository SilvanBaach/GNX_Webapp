# Administration

Im Folgenden werden die Hauptanwendungsfälle aus Sicht der Administration dargelegt:

## Registrierungscodes verwalten

Es muss möglich sein, neue Codes zu erstellen, abgelaufene Codes zu reaktivieren und gültige Codes zu deaktivieren. Beim Erstellen eines neuen Codes soll zudem ausgewählt werden können, welche Rolle dem neuen Benutzer zugeordnet wird bei der Registrierung. Mithilfe dieses generierten Codes kann sich ein weiteres Mitglied innerhalb der nächsten 24h in der Webapp registrieren.

## User Verwaltung

Es muss möglich sein alle Benutzerdaten zu editieren sowie das Passwort zurückzusetzen. Ebenfalls sollen User gesperrt und wieder entsperrt werden können. Die Benutzer sollen in eine Tablaren Ansicht dargestellt werden.

## Team Verwaltung

Es soll möglich sein, neue Teams anzulegen und wieder zu löschen, sowie bestehende Teams zu editieren. Ein Team muss mindestens einen einmaligen Namen haben sowie einem Team Typen zugeordnet werden.

## Team Typen Verwaltung

Es soll möglich sein neue Team Typen zu erstellen und bestehende zu editieren. Löschen soll im Webapp selbst aber nicht möglich sein.

# Mitglieder

Im Folgenden werden die Hauptanwendungsfälle aus Sicht der Mitglieder dargelegt:

## Berechtigungen

Jedes Mitglied kann in beliebig vielen Teams angehören. Die Teamtypen diese Teams wiederum, definieren welche Berechtigungen der einzelne Benutzer besitzt, sprich welche Seiten für ihn erreichbar sind und welche nicht.

## Registrierung

Die Registrierung eines neuen Benutzerkontos muss bei einem «Staff» Mitglied beantragt werden.

Bei einer neuen Registrierung sollen verschiedene Daten vom Mitglied eingegeben werden können. Unter anderem Wohnort, Name, Alter. Die Registrierung soll nur möglich sein mithilfe eines einmaligen Registrierungscodes, welcher 24 h lang gültig ist.

## Login

Jedes Vereinsmitglied soll sich über eine Login-Seite anmelden können. Das Mitglied soll sein Passwort maximal 5-mal falsch eingeben können, bevor der Benutzer gesperrt ist. Zudem soll es die Möglichkeit geben das Passwort via hinterlegte E-Mail-Adresse zurückzusetzen.

## Dashboard

Das Dashboard stellt die Startseite für jedes Vereinsmitglied dar. Hier sollen aktuelle Informationen, links zu Social-Media-Kanälen sowie die nächsten anstehenden Termine oder Events aufgezeigt werden.

## Calendar

Das Ziel des Kalenders ist es, dass Teams Intern Trainingstermine finden können. Es soll möglich sein Zeitbereiche, Abwesenheit, Unklar oder Offen für jeden Tag zu konfigurieren. Zudem soll die Eingabe nicht auf die nächste Woche beschränkt sein, sondern beliebig in die Zukunft.

In einer Tabelle soll ebenfalls basierend auf dem eingegebenen Kalenderdaten eine Auflistung der nächsten anstehenden Trainings generiert werden. Dabei soll konfigurierbar sein ab wie vielen Teilnehmern das Training stattfindet.

## Settings

Die Settings Seite soll der Verwaltung des eigenen Benutzers dienen. Folgende Features soll diese Seite beinhalten:

* Hochladen eines Profilbildes
* Ändern der Accountdaten
* Ändern des Passwortes
* Löschen des Benutzers
* Eingabe von Personenbezogenen Informationen

## Drawboard

Das Drawboard ermöglicht es im Browser Team Taktikten zu besprechen. Es soll möglich sein, eigene Bilder hochzuladen, welche dann beschrieben werden können. Abspeichern, laden sowie herunterladen von Zeichnungen soll ebenfalls möglich sein.

## Fileshare

Auf dem Fileshare soll man Dokumente herunterladen bzw. hochladen können. Das Hochladen soll jedoch in einer ersten Version den Administratoren vorbehalten sein. Somit dient er Fileshare am Anfangt erst mal als Downloadportal für Vereinsressourcen.

