import {defaultTheme} from '@vuepress/theme-default'

module.exports = {
    base: "/GNX_Webapp/",
    public: "res/",
    lang: 'en-US',
    title: "GNX Webapp",
    description: "The one and only GNX Webapp",
    theme: defaultTheme({
        logo: "/logo/logo_white.png",
        editLink: true,
        lastUpdated: true,
        contributors: true,
        themePlugins: { // * disable or enable plugins
            externalLinkIcon: true, // ! do not disable because it breaks deployment on netlify
            backToTop: true,
        },
        sidebar: [
            {
                text: 'Ziele und Hauptfunktionen',
                link: "/2_ziele-und-hauptfunktionen/",
                collapsible: false,
                children: [],
            },
            {
                text: "Qualitätsattribute",
                link: "/3_qualitaetsattribute/",
            },
            {
                text: "Bekannte Beschränkungen",
                link: "/4_bekannte-beschränkungen/",
            },
            {
                text: "Verwendete Prinzipien",
                link: "/5_verwendete-prinzipien/",
            },
            {
                text: "Architektur",
                link: "/6_architektur/",
            },
            {
                text: "Externe Schnittstellen",
                link: "/7_extern-schnittstellen/",
            },
            {
                text: "Code",
                link: "/8_code/",
            },
            {
                text: "Data",
                link: "/9_data/",
            },
            {
                text: "Infrastruktur Architektur",
                link: "/10_infrastruktur-architektur/",
            },
            {
                text: "Installation",
                link: "/11_installation/",
            },
            {
                text: "Operation und Support",
                link: "/12_operation-und-support/",
            },
            {
                text: "Entschiedungs-Logbuch",
                link: "/13_entschiedungs-logbuch/",
            },
        ],
        navbar: [],
    }),


    plugins: [],
}
