export async function CSSLoader(path){
    try {
        const res = await fetch(path);
        const data = await res.text();
        return data;
    } catch (error) {
        throw error;
    }
}
