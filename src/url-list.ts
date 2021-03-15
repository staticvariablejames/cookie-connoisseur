export let urls = [
    {url: 'index.html'}
];

export const urlSet = new Set( urls.map( v => v.url ) );
