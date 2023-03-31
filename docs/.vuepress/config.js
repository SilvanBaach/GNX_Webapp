module.exports = {
    // other config options...
    base: "/GNX_Webapp/",
    plugins: [
        [
            'vuepress-plugin-cat',
            {
                inputFile: 'index.md', // the name of the file that will be created
                inputDir: './docs', // the directory where the files to be concatenated are located
                outputDir: './docs', // the directory where the generated HTML file will be located
                separator: '\n\n' // the separator to use between the concatenated files
            }
        ]
    ]
}
