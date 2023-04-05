# CICD
!constant ORGANISATION_NAME "GNX_WebApp"
!constant MIDNIGHT_BLUE "#000F42"
!constant SEA_BLUE "#31B7BC"
!constant HELIX_PURPLE "#381A53"
!constant TEXT_GREY "#575756"
!constant FONT_HEADLINE "Orbitron"
!constant FONT_TEXT "Orbitron Light"

# Further Colors
!constant RED "#FF0000"
!constant GREEN "#00FF00"
!constant BLUE "#0000FF"
!constant BLACK "#000000"
!constant LIGHT_GREY "#E5E5E5"
!constant DARK_GREY "#A5A5A5"
!constant YELLOW "#FFFF00"
!constant CYAN "#00FFFF"
!constant MAGENTA "#FF00FF"
!constant WHITE "#FFFFFF"
!constant TRANSPARENT "#00000000"

# Stuff
!constant STROKE_WIDTH_XSMALL 1
!constant STROKE_WIDTH_SMALL 2
!constant STROKE_WIDTH_MEDIUM 4
!constant STROKE_WIDTH_LARGE 6
!constant STROKE_WIDTH_X_LARGE 8
!constant STROKE_WIDTH_XX_LARGE 10
!constant FONT_SIZE_SMALL 10
!constant FONT_SIZE_MEDIUM 15
!constant FONT_SIZE_LARGE 20
!constant FONT_SIZE_X_LARGE 25
!constant FONT_SIZE_XX_LARGE 30


workspace "${ORGANISATION_NAME} Workspace" {
    model {

        # The user is a person that uses the software system
        user = person "User" {
            description "A user of the WebApp"
            tags "User"
        }

        # The admin is a person that uses the software system
        admin = person "Admin" {
            description "An admin of the WebApp"
            tags "User"
        }

        emailSystem = softwareSystem "EmailSystem" {
            description "A system to send emails."
            tags "defaultColorWaveElement"
        }

        # GitHub is a software system that hosts the source code for the WebApp and deploys it to the webServer.
        gitHub = softwareSystem "GitHub" {
            description "A GitHub repository to host and deploy the source code."
            tags "GitHub"
        }

        emailSystem -> admin "Sends emails to"
        emailSystem -> user "Sends emails to"

        # The WebApp is a software system that is used by the user and admin via the webBrowser.
        gnxWebApp = softwareSystem "${ORGANISATION_NAME}" {
            # Big Picture
            this -> emailSystem "Sends emails using"
            tags "defaultColorWaveElement"
            admin -> gnxWebApp "Accesses"
            user -> gnxWebApp "Accesses"

            # The database is a software system that is used by the expressServer to store data.
            db = container "DB" {
                description "A database to store data."
                tags "DB, defaultColorWaveElement"
            }

            # The webServer is a software system that hosts the WebApp.
                webServer = container "Web Server" "A web server to host." "Apache" {
                tags "Web Server"
            }

            webApp = container "WebApp" "The web application." {
                webServer -> this "Deliveres static content"
                gitHub -> webServer "Deploys latest"
                tags "Web Browser, defaultColorWaveElement"
            }


            # The expressServer is a software system that is used by the WebApp to access the database.
            expressServer = container "expressServer" "An expressServer to access the database." {
                tags "defaultColorWaveElement"

                this -> webApp "Deliveres dynamic content"


                # The signInController is a component that is used by the expressServer to handle sign in requests.
                signInController = component "SignInController" {
                    description "A controller to handle sign in requests."
                    tags "defaultColorWaveElement"
                }

                # The registerController is a component that is used by the expressServer to handle register requests.
                registerController = component "RegisterController" {
                    description "A controller to handle register requests."
                    tags "defaultColorWaveElement"
                }

                # The securityComponent is a component that is used by the expressServer to handle security.
                securityComponent = component "SecurityComponent" {
                    description "A component to handle security."
                    tags "defaultColorWaveElement"
                }

                # The resetPasswordController is a component that is used by the expressServer to handle reset password requests.
                resetPasswordController = component "ResetPasswordController" {
                    description "A controller to handle reset password requests."
                    tags "defaultColorWaveElement"
                }

                # The loginController is a component that is used by the expressServer to handle login requests.
                loginController = component "LoginController" {
                    description "A controller to handle login requests."
                    tags "defaultColorWaveElement"
                }

                emailComponent = component "EmailComponent" {
                    description "A component to send emails."
                    tags "defaultColorWaveElement"
                }

                signInController -> securityComponent "Uses"
                registerController -> securityComponent "Uses"
                loginController -> securityComponent "Uses"
                resetPasswordController -> securityComponent "Uses"
                resetPasswordController -> emailComponent "Uses"
                emailComponent -> emailSystem "Sends emails using"
                securityComponent -> db "Fetches data from"

            }
        }
    }

    views {

        branding {
            logo "https://cdn0.gamesports.net/league_team_logos/182000/182881.jpg"
            font ${FONT_HEADLINE}
        }

        systemContext gnxWebApp {
            title "System Context for ${ORGANISATION_NAME}"
            include *
            autoLayout lr
        }

        container gnxWebApp {
            #
            include *
            autoLayout rl
        }


        component expressServer {
            include *
            autoLayout tb
        }

        styles {

            element "defaultColorWaveElement" {
                background "${SEA_BLUE}"
                stroke "${MIDNIGHT_BLUE}"
                color "${WHITE}"
                strokeWidth "${STROKE_WIDTH_MEDIUM}"
                fontSize "${FONT_SIZE_MEDIUM}"
            }

            relationship "Relationship" {
                color "${HELIX_PURPLE}"
                thickness ${STROKE_WIDTH_X_LARGE}
                fontSize ${FONT_SIZE_XX_LARGE}
            }

            element "User" {
                shape Person
                background "${MIDNIGHT_BLUE}"
                # Stroke "${SEA_BLUE}" Dont use stroke on person it looks weird
                color "${WHITE}"
            }

            element "Web Browser" {
                shape WebBrowser
            }

            element "Web Server" {
                shape RoundedBox
            }

            element "GitHub" {
                shape Cylinder
            }

            element "DB" {
                shape Cylinder
            }

        }
    }
}
