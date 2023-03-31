import { defaultTheme } from '@vuepress/theme-default'
module.exports = {
    base: "/GNX_Webapp/",
    lang: 'en-US',
    title: "GNX Webapp",
    description: "The one and only GNX Webapp", //theme: '@vuepress/theme-default', // don't enable, breaks. Maybe need to install it first?
    theme: defaultTheme({
    //logo: "/images/logo.png",
    editLink: false,
    smoothScroll: true,
    darkMode: true,
    sidebar: false,
    lastUpdated: true,
    contributors: false,
    search: false,
    themePlugins: { // * disable or enable plugins
      externalLinkIcon: true, // ! do not disable because it breaks deployment on netlify
      backToTop: false,
    },
    navbar: [
      {
        text: "Privacy Notice",
        link: "/data-collection-and-privacy-notice/",
      },
    ],
  }),


    plugins: [],
}
