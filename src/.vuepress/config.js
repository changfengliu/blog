module.exports = {
	title: "我的博客",
	description: '工程师改变世界',
	base: '/blog/',
	dest: './docs',
	themeConfig: {
		search: true,
    nav: [
	    { text: '首页', link: '/index.md' },
			{
        text: '深入理解系列',
        items: [
          { text: '深入理解JavaScript', link: 'https://changfengliu.github.io/css-deepen-understanding/' },
          { text: '深入理解CSS', link: 'https://changfengliu.github.io/css-deepen-understanding/' },
					{ text: '深入理解HTML', link: 'https://changfengliu.github.io/css-deepen-understanding/' }
        ]
      },
			{ text: 'About Me', link: '/site/about.md' },
      {
				text: 'Github',
				link: 'https://github.com/changfengliu'
			}
    ],
    sidebar: [
			'/old/css-tricks.md',
			'/old/js-ticker.md',
			'/old/js-array-sort.md',
			'/old/chalk-code.md',
			'/old/global-image-onerror.md',
			// {
      //   title: '入门指引',
      //   collapsable: false,
      //   children: [
      //
      //   ]
      // }
    ]
	}
}
