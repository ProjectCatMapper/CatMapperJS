import React from 'react';

const FAQContent = () => {
    return (
        <div style={{ display: 'flex', fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Sidebar Navigation */}
            <nav style={{ flex: '0 0 250px', padding: '20px', borderRight: '1px solid #eee', height: 'fit-content', position: 'sticky', top: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', marginTop: '0' }}>Contents</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '10px' }}><a href="/FAQ#categories" style={{ textDecoration: 'none', color: '#0056b3' }}>Catalogued Categories</a></li>
                    <li style={{ marginBottom: '10px' }}><a href="/FAQ#sources" style={{ textDecoration: 'none', color: '#0056b3' }}>Category Sources</a></li>
                    <li style={{ marginBottom: '10px' }}><a href="/FAQ#view-datasets" style={{ textDecoration: 'none', color: '#0056b3' }}>Viewing Datasets</a></li>
                    <li style={{ marginBottom: '10px' }}><a href="/FAQ#completeness" style={{ textDecoration: 'none', color: '#0056b3' }}>Data Completeness</a></li>
                    <li style={{ marginBottom: '10px' }}><a href="/FAQ#cataloguing-method" style={{ textDecoration: 'none', color: '#0056b3' }}>Cataloguing Method</a></li>
                    <li style={{ marginBottom: '10px' }}><a href="/FAQ#data-types" style={{ textDecoration: 'none', color: '#0056b3' }}>Stored Data Types</a></li>
                    <li style={{ marginBottom: '10px' }}><a href="/FAQ#download" style={{ textDecoration: 'none', color: '#0056b3' }}>Download Options</a></li>
                </ul>
            </nav>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '20px 40px' }}>
                <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>FAQ</h1>

                <section id="categories" style={{ marginBottom: '40px' }}>
                    <h3>What kinds of categories does CatMapper catalogue?</h3>
                    <p>CatMapper contains two apps that catalogue different kinds of categories. SocioMap focuses on categories frequently used by social scientists (e.g., ethnicities, languages, religions, districts, polities, and occupations). ArchaMap focuses on categories frequently used by archaeologists (e.g., sites, ceramic types, time periods, projectile point types, faunal categories).</p>
                </section>

                <section id="sources" style={{ marginBottom: '40px' }}>
                    <h3>Where do all the categories stored in CatMapper come from?</h3>
                    <p>CatMapper catalogues and organizes categories from thousands of datasets. The database is constantly growing as users propose adding categories from new data sources. If you know of a dataset with categories that isn’t yet linked to CatMapper, please contact us about adding it (<a href="mailto:dhruschk@asu.edu">dhruschk@asu.edu</a>). We can walk you through the steps of adding it as a registered user.</p>
                </section>

                <section id="view-datasets" style={{ marginBottom: '40px' }}>
                    <h3>Where can I see the datasets that CatMapper stores categories for?</h3>
                    <p>There are several places where you can find the full list of currently stored datasets:</p>
                    <ol style={{ paddingLeft: '20px', margin: '10px 0' }}>
                        <li style={{ marginBottom: '12px', paddingLeft: '5px' }}>
                            In the <strong>download page</strong> (<a href="https://catmapper.org/download">https://catmapper.org/download</a>), you can download the file starting with “datasetNodes”
                        </li>
                        <li style={{ marginBottom: '12px', paddingLeft: '5px' }}>
                            In the <strong>home page</strong> for sociomap (<a href="https://catmapper.org/sociomap">https://catmapper.org/sociomap</a>) or archamap (<a href="https://catmapper.org/archamap">https://catmapper.org/archamap</a>), find and press the blue button “download datasets list” in the “dataset progress” section
                        </li>
                        <li style={{ marginBottom: '12px', paddingLeft: '5px' }}>
                            In the <strong>explore page</strong> (<a href="https://catmapper.org/sociomap/explore">https://catmapper.org/sociomap/explore</a>), leave the text box blank, click “advanced” search and select “DATASET” under Category Domain. Press the search button (magnifying glass icon), and the full list of datasets will show up in the search results. You can download metadata on these datasets by clicking “Download Results”
                        </li>
                    </ol>
                </section>

                <section id="completeness" style={{ marginBottom: '40px' }}>
                    <h3>How complete are the categories linked from each datasets?</h3>
                    <p>In most cases, the full set of categories from a dataset are linked into CatMapper. CatMapper is very careful to preserve versioning of datasets, so it often stores several complete versions of the same dataset (e.g. glottolog 4.4 and glottolog 5.2). In those cases where there is not strict versioning of a dataset, CatMapper may only store categories that have been added to a dataset up to a certain time point. For example, CatMapper may only include categories from Wikidata that were scraped in October, 2025 or categories from the Database of Religious History that were available before January 1, 2025. If you find a category missing from a dataset, please let us know (<a href="mailto:dhruschk@asu.edu">dhruschk@asu.edu</a>)!</p>
                </section>

                <section id="cataloguing-method" style={{ marginBottom: '40px' }}>
                    <h3>How does CatMapper catalogue categories?</h3>
                    <p>CatMapper stores all categories and datasets as <strong>nodes</strong> in a vast network. When a specific dataset uses a category, CatMapper maintains a <strong>“USES” tie</strong> from that dataset to the category storing all the claims that dataset makes about that category (e.g. geospatial location, country, time period, and other contextual factors such as language, religion, and parent categories). Based on these claims, CatMapper also maintains <strong>contextual ties</strong> the show information such as what country a category is found in, what language or religion is associated with that category, and if there are any parents of that category (e.g. The U.S.A. is a parent of the state of Ohio). You can view and navigate this network in the network explorer tab in the info page for a given node (e.g., <a href="https://catmapper.org/sociomap/SM250827">https://catmapper.org/sociomap/SM250827</a> for the Yoruba ethnic category).</p>
                </section>

                <section id="data-types" style={{ marginBottom: '40px' }}>
                    <h3>What kinds of data does CatMapper store for each category?</h3>
                    <p>CatMapper focuses on metadata that can assist in finding categories and discriminating between categories. These include geospatial location (country, latitude/longitude, subdistrict), time period, parent relationship (e.g. Maya is a parent of Kaqchikel), and population estimates. CatMapper stores all of this information in “Uses” ties from specific datasets (see <strong>How does CatMapper catalogue categories?</strong>), to ensure users can find where the metadata came from.</p>
                </section>

                <section id="download" style={{ marginBottom: '40px' }}>
                    <h3>Where can I download the full set of data stored in CatMapper?</h3>
                    <p>Current and past versions of both SocioMap and ArchaMap are available for download at <a href="https://catmapper.org/download">https://catmapper.org/download</a></p>
                </section>
            </main>
        </div>
    );
};

export default FAQContent;