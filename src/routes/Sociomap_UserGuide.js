import React from 'react'
import { Container, Typography, Box, List, ListItem, ListItemText, Divider, Link } from '@mui/material';
import {
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
  } from '@mui/material';
import '@fontsource/source-sans-pro';
import Navbar from '../components/Navbar'
import "../components/apiguide.css"

 const Sociomap_UserGuide = () => {
        
   return (
    <div style={{backgroundColor:"white"}}>
         <Navbar />
         <h1 id="chapter-1-welcome-to-catmapper">Chapter 1: Welcome to
CatMapper</h1>
<p>SocioMap organizes dynamic and complex category systems commonly used
by social scientists and policymakers, including ethnicities, languages,
religions, and political districts. Each of these domains includes
thousands of categories encoded in diverse, dynamic and incompatible
ways across a growing corpus of thousands of datasets. This creates a
bottleneck for social scientists trying to merge diverse datasets to
conduct novel analyses. SocioMap aids in overcoming this bottleneck by
assisting users in several key activities.</p>
<h2 id="what-does-catmapper-do">1.1 What does CatMapper do?</h2>
<p><strong><u>Objectives</u>.</strong> CatMapper assists users in:</p>
<ol type="1">
<li><p><strong>Exploring</strong> where data is available for complex,
evolving categories commonly used in the social sciences (e.g., ethnic,
religious, language, geospatial, and archaeological categories). For
example, where can I find data on speakers of Yoruba or people who
identify as Yoruba or followers of Isese, the Yoruba religion.</p></li>
<li><p><strong>Translating</strong> categories from new datasets to
categories already stored in CatMapper.</p></li>
<li><p><strong>Merging</strong> data across diverse, external datasets
by these complex categories.</p></li>
<li><p><strong>Documenting</strong> and <strong>Sharing</strong> their
translations and merges so that other users can check and re-use their
work.</p></li>
</ol>
<p><strong><u>Apps.</u></strong> CatMapper currently includes two apps
aimed at organizing two kinds of categories. SocioMap organizes
sociopolitical categories, such as ethnicities, religions, languages,
and administrative districts. ArchaMap organizes categories of material
objects used in archaeology, including sites, ceramic types, lithic and
projectile point types, and faunal types. Our hope in the future is to
extend CatMapper’s capabilities to other classes of complex, dynamic
categories.</p>
<h2 id="key-concepts-in-catmapper">1.2 Key concepts in CatMapper</h2>
<p>CatMapper stores information on <strong>categories</strong>
(<strong>Table 1</strong>)<strong>,</strong> how they are related to
each other, and how they are encoded by diverse
<strong>datasets</strong>.</p>
<p><strong>Table 1. Current CatMapper Category Domains</strong></p>
<table style={{width:"97%"}}>
<colgroup>
<col style={{width:"14%"}} />
<col style={{width:"25%"}} />
<col style={{width:"57%"}} />
</colgroup>
<thead>
<tr>
<th style={{textalign:'left'}}>App</th>
<th style={{textalign:'left'}}>Primary Domain</th>
<th style={{textalign:'left'}}>Subdomains</th>
</tr>
</thead>
<tbody>
<tr>
<td style={{textalign:'left'}}>SocioMap</td>
<td style={{textalign:'left'}}>ETHNICITY</td>
<td style={{textalign:'left'}}></td>
</tr>
<tr>
<td style={{textalign:'left'}}>SocioMap</td>
<td style={{textalign:'left'}}>LANGUOID</td>
<td style={{textalign:'left'}}>LANGUAGE, DIALECT, FAMILY</td>
</tr>
<tr>
<td style={{textalign:'left'}}>SocioMap</td>
<td style={{textalign:'left'}}>RELIGION</td>
<td style={{textalign:'left'}}></td>
</tr>
<tr>
<td style={{textalign:'left'}}>ArchaMap</td>
<td style={{textalign:'left'}}>CERAMIC</td>
<td style={{textalign:'left'}}>CERAMIC_TYPE, CERAMIC_WARE</td>
</tr>
<tr>
<td style={{textalign:'left'}}>ArchaMap</td>
<td style={{textalign:'left'}}>PROJECTILE_POINT</td>
<td style={{textalign:'left'}}>PROJECTILE_POINT_CLUSTER,
PROJECTILE_POINT_TYPE</td>
</tr>
<tr>
<td style={{textalign:'left'}}>ArchaMap</td>
<td style={{textalign:'left'}}>PERIOD</td>
<td style={{textalign:'left'}}></td>
</tr>
<tr>
<td style={{textalign:'left'}}>All</td>
<td style={{textalign:'left'}}>AREA</td>
<td style={{textalign:'left'}}>ADM0-ADM4, ADME, ADMD, ADMX, PPL, SITE,
REGION</td>
</tr>
<tr>
<td style={{textalign:'left'}}>All</td>
<td style={{textalign:'left'}}>GENERIC</td>
<td style={{textalign:'left'}}></td>
</tr>
</tbody>
</table>
<p>CatMapper stores contextual information about categories through a
range of ties (e.g., contains, district_of, language_of, religion_of)
(<strong>Table 2</strong>).</p>
<p><strong>Table 2. Ties that store contextual information about
categories</strong></p>
<table style={{width:"97%"}}>
<colgroup>
<col style={{width:"37%"}} />
<col style={{width:"59%"}} />
</colgroup>
<thead>
<tr>
<th style={{textalign:'left'}}>Tie</th>
<th style={{textalign:'left'}}>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style={{textalign:'left'}}>X CONTAINS Y</td>
<td style={{textalign:'left'}}>Y is a sub-category of X</td>
</tr>
<tr>
<td style={{textalign:'left'}}>X DISTRICT_OF Y</td>
<td style={{textalign:'left'}}>X is a geospatial locale for Y</td>
</tr>
<tr>
<td style={{textalign:'left'}}>X LANGUAGE_OF Y</td>
<td style={{textalign:'left'}}>X is a language associated with Y</td>
</tr>
<tr>
<td style={{textalign:'left'}}>X RELIGION_OF Y</td>
<td style={{textalign:'left'}}>X is a religion associated with Y</td>
</tr>
<tr>
<td style={{textalign:'left'}}>X USES Y</td>
<td style={{textalign:'left'}}>Dataset X uses the category Y</td>
</tr>
</tbody>
</table>
<p>CatMapper catalogues how thousands of external datasets store data on
specific categories from the domains (e.g. ethnicity, language,
districts, religion, and archaeological categories) described above. For
example, Geonames.org, Statoids, GADM, and MARC are four geographical
database that store information on thousands of administrative
subdivisions worldwide. While they store information about many of the
same categories, they usually encode the same categories in very
different ways and store different information about them. For example,
Table 3 illustrates the different Keys each dataset uses to uniquely
encode Greenland, the different names they use and the different parents
they assign to Greenland.</p>
<p><strong>Table 3. How different datasets encode information about
Greenland</strong></p>
<table style={{width:"97%"}}>
<colgroup>
<col style={{width:"15%"}} />
<col style={{width:"25%"}} />
<col style={{width:"31%"}} />
<col style={{width:"25%"}} />
</colgroup>
<thead>
<tr>
<th style={{textalign:'left'}}>Dataset</th>
<th style={{textalign:'left'}}>KEY</th>
<th style={{textalign:'left'}}>NAME</th>
<th style={{textalign:'left'}}>PARENT</th>
</tr>
</thead>
<tbody>
<tr>
<td style={{textalign:'left'}}>GADM</td>
<td style={{textalign:'left'}}>GID: GRL</td>
<td style={{textalign:'left'}}>Greenland</td>
<td style={{textalign:'left'}}></td>
</tr>
<tr>
<td style={{textalign:'left'}}>GEONAMES</td>
<td style={{textalign:'left'}}>geonameid: 3425505</td>
<td style={{textalign:'left'}}>Kalaallit Nunaat,Grønland,…</td>
<td style={{textalign:'left'}}>Kingdom of Denmark</td>
</tr>
<tr>
<td style={{textalign:'left'}}>sTATOIDS</td>
<td style={{textalign:'left'}}>HASC: GL</td>
<td style={{textalign:'left'}}>Greenland</td>
<td style={{textalign:'left'}}></td>
</tr>
<tr>
<td style={{textalign:'left'}}>MARC</td>
<td style={{textalign:'left'}}>ID: gl</td>
<td style={{textalign:'left'}}>Greenland</td>
<td style={{textalign:'left'}}>North America</td>
</tr>
</tbody>
</table>
<p>CatMapper uses a network to represent the different claims (e.g.,
about names, about parents) each dataset makes about Greenland.
Specifically, CatMapper represents Greenland and each of the datasets as
unique nodes with <strong>USE ties</strong> emanating from each of the
dataset nodes to the Greenland node. Figure 1 illustrates the
<strong>USES tie</strong> from the Geonames dataset node to the
Greenland node, with a box including information from the <strong>USES
tie</strong>, including the Key, names, parent, country, and latitude
and longitude (in geoCoords) that Geonames specifically assigns to
Greenland.</p>
<p><strong>Figure 1. Contents of the USES tie from Geonames to
Greenland.</strong></p>
<p><img src="media/image1.png"
style={{width:5.79167,height:3.23342}} /></p>
<p>Indeed, whenever CatMapper catalogues how a dataset uses a specific
category, it stores this in such a <strong>USES tie</strong> from the
dataset to the category. This USES tie records: (1) how the dataset
encodes that category (i.e., name, key), (2) claims that the dataset
makes about the category (e.g., geospatial location, population
estimate, associated languages and religions, other categories it
contains or is contained by). A <strong>key</strong> specifies how a
specific dataset uniquely encodes a specific category. A simple key
involves a single variable and value (e.g., V131 = 3). More complex keys
can involve combinations of variables and values (e.g., V131 = 3 AND
V024 = 1).</p>
<p>A <strong>category set</strong> is the set of categories in a
specific domain encoded by a specific dataset (e.g., ethnicities coded
in DHS Guatemala 1995 survey, language spoken coded in WVS Cote
D’Ivoire).</p>
<h1 id="chapter-2-how-to-exploring">Chapter 2: How-to: Exploring</h1>
<p>Here we will give a quick vignette of using one of the CatMapper
apps. The goal is to give you a sense of what you can do within the
Explore functions of CatMapper and what the workflow is.</p>
<p>In this Chapter, we will:</p>
<ol type="1">
<li><p>Find contextual information about an ethnicity-Yoruba. However,
it’s possible to use the same approach to find information languages,
districts, or religions in SocioMap and archaeological categories in
ArchaMap.</p></li>
<li><p>See how a certain dataset encodes an ethnicity</p></li>
<li><p>Find other ethnicities, languages, districts, and religions
related to a specific category.</p></li>
<li><p>View the entire set of datasets with encodings stored in
SocioMap</p></li>
<li><p>Find all variables that are available for a specific ethnicity,
language, district, religion.</p></li>
<li><p>Find all the ethnicities associated with a specific
country.</p></li>
</ol>
<p>In this example, we want to know about the ethnic group Yoruba. We go
through the process of getting the contextual information, finding the
datasets that include information about Yoruba, how certain datasets
encode the ethnic category of Yoruba, and find other information about
Yoruba within SocioMap.</p>
<h2
id="question-how-can-i-find-contextual-information-on-ethnicities-languages-districts-religions-and-datasets">2.1
Question: How can I find contextual information on ethnicities,
languages, districts, religions, and datasets? </h2>
<p>In this case, we want contextual information about the ethnic group
Yoruba.</p>
<ol type="1">
<li><p>Go to https://www.catmapper.org/js/sociomap</p></li>
<li><p>Click on the <em>Explore</em> button.<img src="media/image2.png"
style={{width:6.5,height:3.18472}}
alt="A screenshot of a website Description automatically generated" /></p></li>
<li><p>Under <em>Select category domain</em>, choose which type of
category (e.g., ethnicity, language, district, religion) you would like
to search for<em>.</em></p>
<ul>
<li>Here, we want to search within the “Ethnicity” category.</li>
</ul></li>
<li><p>In the box to the right type the category name you are searching
for<em>.</em></p>
<ul>
<li>Here, we are searching “Yoruba”<em> </em></li>
</ul></li>
<li><p>If you would like to limit your search to a particular country,
you can select the ‘Advanced Search’ option, choose that country in the
<em>Country</em> box. </p></li>
<li><p>Once you press the <em>Search</em> icon, a set of search results
will appear below. </p></li>
</ol>
<p><img src="media/image3.png"
style={{width:6.52083,height:2.53472}} /></p>
<ol start="7" type="1">
<li>Click on the row for the search result you would like to explore,
and a <em>Info page</em> will open. </li>
</ol>
<p><img src="media/image4.png"
style={{width:6.54167,height:2.84028}} /></p>
<p>The page that opens will include contextual information about the
category, including the relevant countries and languages, datasets
containing the category with information on population estimates, sample
size, geospatial location and name used by the dataset.</p>
<p>Under the header Category Info, information about the ethnicity is
summarized. Below, the ‘Samples’ table gives additional information
about the datasets that contain information about the category. The
‘Maps’ tab shows geographic information about the category. The ‘Network
Explorer’ tab displays information about the relationships that the
category has with other categories within SocioMap.</p>
<h2
id="question-how-can-i-identify-which-datasets-include-information-on-a-specific-ethnicity-language-district-or-religion">2.2
Question: How can I identify which datasets include information on a
specific ethnicity, language, district, or religion?</h2>
<p>Now that we have accessed the contextual information about the
category, we to know what datasets have information about the category
of interest.</p>
<p>The Dataset tab of the <em>Info Page</em> page contains a row for
each dataset that contains information on a specific category. In some
cases, a dataset may contain information on that category from different
places or times. In those cases, there may be multiple rows for the same
ethnicity from the same dataset.</p>
<blockquote>
<p><img src="media/image5.png"
style={{width:6.5,height:2.82219}} /></p>
</blockquote>
<p>In this case, there are many different datasets that contain
information about Yoruba. Exploring the sample section shows that
different datasets have information about Yoruba from Nigeria, Benin,
and Ghana. In addition, some of the information from the dataset are
from different times, and some are separated out between ‘Men’ and
‘Women.’</p>
<p>When available, there is a link to the source of the dataset, as is
the case for HRAF CCC, Wikipedia, and Wikidata.</p>
<p>Alternatively, the ‘Network Explorer’ tab can also visualize the
information about which datasets contain information on the category. In
the ‘Network Explorer’ tab, choose “USES” in the drop-down menu labeled
“Relationships.”</p>
<p>This will show links to all datasets with data relevant to the
category.</p>
<figure>
<img src="media/image6.png" style={{width:6.5,height:4.23611}}
alt="A screenshot of a computer Description automatically generated" />
<figcaption aria-hidden="true">A screenshot of a computer Description
automatically generated</figcaption>
</figure>
<p>To explore metadata for a dataset of interest, hovering over the
relevant node will display a summary of the dataset. Double-clicking a
different node in the networkwill open the <em>Info page</em> page for
that node. (<em>Note:</em> The <em>Network Explorer</em> only includes a
maximum of 10 nodes.  To view all available nodes, please look at the
drop down list under <em>"Choose node to view relationship."</em>)</p>
<p>In this case, we want to know more about the eHRAF dataset. We can
view it from the ‘Network Explorer’ tab for Yoruba. If you hover over
the node, a summary of the dataset will be displayed.</p>
<figure>
<img src="media/image7.png" style={{width:5.81308,height:3.94681}}
alt="A screenshot of a computer Description automatically generated" />
<figcaption aria-hidden="true">A screenshot of a computer Description
automatically generated</figcaption>
</figure>
<p>Clicking the node will lead to the <em>Info page</em> for the eHRAF
dataset. Here you can see all the other categories that are also
described within that dataset.</p>
<figure>
<img src="media/image8.png" style={{width:5.84079,height:4.03738}}
alt="A screenshot of a computer Description automatically generated" />
<figcaption aria-hidden="true">A screenshot of a computer Description
automatically generated</figcaption>
</figure>
<h2
id="question-how-can-i-see-how-a-dataset-encodes-a-specific-ethnicity-language-district-or-religion">2.3
Question: How can I see how a dataset encodes a specific ethnicity,
language, district, or religion?</h2>
<ol type="1">
<li><p>If you want to merge data on Yoruba across different datasets
it’s essential to find out how each dataset uniquely encodes the ethnic
category. There are a number of ways to access the Keys a dataset uses
to encode category. Here is one way.</p></li>
<li><p>Return to the <em>Network explorer</em> for ethnic category of
Yoruba (see section 2.1)</p></li>
<li><p>In the <em>Network Explorer</em> box at the bottom of the
<em>Info page</em>, choose USES in the drop down menu labeled
"<em>Relationship"</em>  </p></li>
<li><p>This will show all USES ties from different datasets to the
category of Yoruba</p></li>
<li><p>Hover over the link to the relevant dataset.  It will show the
variable and variable value used to encode that category. Here we see
that the 2015 Nigeria Demographic and Health Survey (DHS) encodes Yoruba
with the Key V131: 298</p></li>
</ol>
<blockquote>
<p><img src="media/image9.png"
style={{width:6.49306,height:2.93056}} /></p>
</blockquote>
<h2
id="question-how-can-i-identify-and-explore-ethnicities-languages-districts-and-religions-that-are-related-to-a-specific-category">2.4
Question: How can I identify and explore ethnicities, languages,
districts and religions that are related to a specific category?</h2>
<p>In this case, we want to know what language(s) the Yoruba speak, what
other ethnicities are related to the Yoruba, where the Yoruba live, and
what religion(s) the Yoruba practice. This information can be found
through the <em>Network Explorer</em>.</p>
<p>In the <em>Network Explorer</em> tab in the <em>Info page</em>, the
drop down menu labeled "<em>Choose Relationship to View"</em> gives you
the choice of exploring CONTAINS ties, LANGUAGE_OF ties, DISTRICT_OF
ties, and USES ties which describe how different datasets encode the
category.</p>
<figure>
<img src="media/image10.png" style={{width:5.20729,height:5.01869}}
alt="A screenshot of a computer Description automatically generated" />
<figcaption aria-hidden="true">A screenshot of a computer Description
automatically generated</figcaption>
</figure>
<p>Here, selecting CONTAINS in the <em>Relationship</em> dropdown, you
can see that Yoruba contains several smaller ethnic
categories(e.g. Ekiti, Ijebu, Ikale, Oyo, Ibarapa, Oworo, Igbeti, Egba,
and Ede Ije are visible). You can also see that Yoruba is contained
within the broader <em>Southeastern</em> category.</p>
<figure>
<img src="media/image11.png" style={{width:6.48611,height:5.02778}}
alt="A screenshot of a computer Description automatically generated" />
<figcaption aria-hidden="true">A screenshot of a computer Description
automatically generated</figcaption>
</figure>
<p>Changing the <em>Relationship</em> dropdown to RELIGION_OF, you can
see that the religion practiced by the Yoruba is Isese.</p>
<figure>
<img src="media/image12.png" style={{width:6.48611,height:5.91667}}
alt="A screenshot of a computer Description automatically generated" />
<figcaption aria-hidden="true">A screenshot of a computer Description
automatically generated</figcaption>
</figure>
<p>Changing the <em>Relationship</em> to DISTRICT_OF, you can see that
the Yoruba live in Ghana, Benin, Nigeria, and Togo. In some examples,
you may be able to find more specific administrative level districts by
changing the Administrative level in the <em>Domain</em> drop down.</p>
<p>To access additional information about a node seen within the
<em>Network Explorer</em>, you can click the node of interest to access
the <em>Info page</em>.</p>
<p><em>Note:</em> The <em>Network Explorer</em> only includes a maximum
of 10 nodes.  To view all available nodes, please look at the drop-down
list under <em>"Choose node to view relationship."</em></p>
<h2
id="question-how-can-i-view-the-entire-set-of-datasets-with-encodings-stored-in-sociomap">2.5
Question: How can I view the entire set of datasets with encodings
stored in SocioMap?</h2>
<p>In some cases, you may want to know what datasets have been
cataloguedin SocioMap in general. To download the full current list of
datasets, go to</p>
<p><a href="https://www.catmapper.org/js/sociomap"
class="uri">https://www.catmapper.org/js/sociomap</a></p>
<p>Scroll to the box “Dataset Progress” and click on the “Download
Dataset List”. This will download the metadata on all Datasets currently
catalogued in SocioMap.</p>
<p>You may be interested in what datasets exist for a country of
interest. This can give you a sense of what exists within SocioMap.</p>
<ol type="1">
<li><p>Click on the <em>Explore</em> tab and choose
<em>Search</em>. </p></li>
<li><p>Choose DATASET under <em>Select category type.  </em></p></li>
<li><p>Leave search term box blank<em>. </em></p></li>
<li><p>If you would like to limit your search to a particular country,
choose that country under the <em>Country</em> dropdown menu (under
Advanced Search). </p></li>
<li><p>Once you press the <em>Search</em> icon, a set of search results
will appear below.</p></li>
</ol>
<p><img src="media/image13.png"
style={{width:6.5,height:2.93056}} /></p>
<p>Here, you can see a list of all the datasets stored in SocioMap.</p>
<p><img src="media/image14.png"
style={{width:6.47917,height:2.93056}}/>By checking the <em>Advanced
search</em> box, you can then choose a country of interest from the
<em>Country</em> dropdown menu. Here, we are looking at the datasets
stored in SocioMap that are have information from Ghana.</p>
<h2
id="question-how-can-i-find-all-the-ethnicities-associated-with-a-specific-country">2.6
Question: How can I find all the ethnicities associated with a specific
country?</h2>
<ol type="1">
<li><p>Click on the <em>Explore</em> tab and choose
<em>Search</em>. </p></li>
<li><p>Choose ETHNICITY under <em>Select category type.  </em></p></li>
<li><p>Leave <em>search box</em> blank<em>. </em></p></li>
<li><p>To limit your search to a particular country, check the
<em>Advanced search</em> box and choose that country under the
<em>Country</em> dropdown menu. </p></li>
<li><p>Once you press the <em>Search</em> button, a set of search
results will appear below.</p></li>
</ol>
<p><img src="media/image15.png"
style={{width:6.47917,height:2.88889}} /></p>
<p>In this case, we are looking for all the ethnicities associated with
Ghana. You can see that there are a total of 166 associated ethnicities
stored within SocioMap. Clicking the row will allow you get contextual
information about that Ethnicity.</p>
        </div>
      );
    }

export default Sociomap_UserGuide;