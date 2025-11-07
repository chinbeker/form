export async function CSSLoader(path){
    const res = await fetch(path);
    const data = await res.text();
    return data;
}
