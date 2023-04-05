
# Operation und Support

Der Betrieb und die Wartung von Systemen sind entscheidende Aspekte bei der Implementierung und Nutzung von Softwarelösungen. Daher ist dieses Kapitel unerlässlich. Hier soll explizit beschrieben werden, wie die Systeme überwacht, betrieben und verwaltet werden müssen. In diesem Abschnitt werden einige Fragen behandelt, die bei der Erstellung eines solchen Leitfadens berücksichtigt werden sollten. 

Zunächst sollte geklärt werden, welche Überwachungs- und Supportfunktionen die Software unterstützt und wie dies auf allen Ebenen der Anwendung sichergestellt wird. Dazu gehört die Definition von Mechanismen zur Überwachung der Systemleistung und der Erkennung von Fehlern. Da die Software anschliessend von einigen Projektmitgliedern verwendet wird, ist die Erstellung sowie Einhaltung von Service-Level-Agreements (SLAs) nicht notwendig. 

Ein weiterer wichtiger Aspekt ist die Protokollierung von Fehlern und Statusinformationen. Es sollte festgelegt werden, wo und wie diese Informationen erfasst und gespeichert werden. Die Protokollierung sollte strukturiert und konsistent erfolgen, um eine effiziente Analyse und Fehlerbehebung zu ermöglichen. Dazu werden Technologien und Frameworks evaluiert, welche die Protokollierung sicherstellen. 

Die Aufbewahrung von Protokollen ist nicht wesentlich. Demzufolge gibt es kaum Aufbewahrungsrichtlinien für Protokolldaten. Falls der Speicherplatz voll ist, werden die ältesten Protokolldaten gelöscht. 

Da die Software später als Eigengebrauch eingesetzt wird, ist die manuelle Administrationsaufgaben, wie beispielsweise das Hinzufügen oder Entfernen von Benutzern, die Aktualisierung von Konfigurationseinstellungen oder die Durchführung von Sicherheitsüberprüfungen, hinfällig. Da das Projekt eine WebApp sein wird, muss bei einer Konfigurationsänderung das System nicht zwingend neu gestartet werden. Ein Grossteil der Änderungen kann ohne Neustart wirksam gemacht werden. In einem Folgeprojekt können Informationen zu möglichen Auswirkungen auf die Systemverfügbarkeit und Strategien zur Minimierung von Ausfallzeiten ebenfalls bereitgestellt werden. 

Die sorgfältige Planung und Dokumentation von Betriebs- und Supportprozessen trägt wesentlich zur Sicherstellung einer hohen Systemverfügbarkeit, Skalierbarkeit und Zuverlässigkeit bei. Sie erleichtert auch die Identifizierung und Behebung von Problemen und ermöglicht es, auf die Bedürfnisse der Stakeholder effektiv zu reagieren 