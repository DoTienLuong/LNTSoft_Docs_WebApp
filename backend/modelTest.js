const { findContentsByCategory } = require('./src/models/contentModel');

(async () => {
  const contents = await findContentsByCategory(1, false);
  console.log(contents);
})();