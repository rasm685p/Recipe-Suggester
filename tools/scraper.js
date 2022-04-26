// This is a tool intended to gather data from specific sources
// The code quality is pretty low and should not be used in production environments
// You are warned that this tool could potentially cause significant problems

const mongoose = require('mongoose');
const puppeteer = require('puppeteer');

const recipeSchema = new mongoose.Schema({
    title: String,
    ingredients: [String],
    image: String,
    source: String
});

const Recipe = mongoose.model('recipes', recipeSchema);

dbconnect = async () => {
    try {
        await mongoose.connect(/*Insert stuff*/);
    }
    catch (err) {
        console.log(err);
    }
}

scrape_kogebogen = async () => {
    //Intialization
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    //Gather recipe links
    let recipes_unprocessed = [];
    let index = 0;

    while (true) {
        await page.goto(`https://www.dk-kogebogen.dk/opskrifter/billedeopskrifter-2.php?id=40&limit=${25 * index}`, {waitUntil: 'networkidle2'});

        if (await page.$('tr > td > a') == null) break;
        recipes_unprocessed.push(...await page.$$eval('tr > td > a', x => x.map(y => y.href)));

        console.clear();
        console.log(`${recipes_unprocessed.length} recipes has been found`);
        index++;
    }

    for (let i = 0; i < recipes_unprocessed.length; i++) {
        await page.goto(recipes_unprocessed[i], {waitUntil: 'networkidle2'});

        let recipe_title = await page.$eval('h1', x => x.innerText);
        let recipe_ingredients = await page.$$eval('.ingredienser > tbody > tr > td:last-child', x => x.flatMap(y => y.innerText.trim() ? (y.innerText.charAt(0).toUpperCase() + y.innerText.slice(1)) : []));
        let recipe_image = await page.$eval('td > div > a > img', x => x.src);

        try {
            const recipe = await Recipe.create({
                title: recipe_title,
                ingredients: recipe_ingredients,
                image: recipe_image,
                source: recipes_unprocessed[i]
            });
            await recipe.save();
        }
        catch (err) {
            console.log(err);
        }

        console.clear();
        console.log(`${(i / recipes_unprocessed.length * 100).toFixed(2)}% recipes has been processed`);
    }

    await browser.close();
    console.log('Task finished successfully');
}

dbconnect();
scrape_kogebogen();