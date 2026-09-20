  // Fallback snapshot — used immediately on load, and for any project whose
  // live skills.json can't be reached (CORS not yet enabled, network error,
  // or the "project" block hasn't been added yet).
  var PROJECTS = [
    { slug:"energy-information-administration", category:"Government & Public Sector",
      name:"Energy Information Administration", tagline:"A million pages. One modern standard.",
      summary:"Modernized a million-page federal energy site to responsive, accessible HTML5 — without disrupting the public data it serves.",
      roles:["Front-End Developer","UI Developer","Accessibility"] },

    { slug:"honeywell-case-study", category:"Engineering & Industrial",
      name:"Honeywell Aerospace", tagline:"Many systems. One interface. Built to scale.",
      summary:"Converted Honeywell's patchwork ordering systems into one scalable, tablet-ready interface built to be reused in everything after.",
      roles:["UX Designer","Interactive Designer","UI Developer"] },

    { slug:"mastercard-case-study", category:"Financial Services",
      name:"Mastercard", tagline:"Many platforms. One application. One network.",
      summary:"Pre-deployment content inventory, taxonomy, sitemap, and wireframes unifying Mastercard's platforms behind a single application.",
      roles:["UX Designer","UI Developer"] },

    { slug:"novartis-case-study", category:"Healthcare & Pharmaceutical",
      name:"Novartis Pharmaceuticals", tagline:"Many sites. One standard. Designed with precision.",
      summary:"Reconciled dozens of self-built team intranets into one governed system, with brand-standard templates and clear access rules.",
      roles:["UX Designer","Interactive Designer","UI Developer"] },

    { slug:"timber-portfolio", category:"Food & Beverage",
      name:"Timber Portfolio", tagline:"A menu, rebuilt to be found.",
      summary:"A full single-page rebuild of Timber Portfolio's menu, catering, and rewards content around one product taxonomy.",
      roles:["Information Architecture","UX Design"] },

    { slug:"old-chicago", category:"Food & Beverage",
      name:"Old Chicago Pizza & Taproom", tagline:"One platform. Every pour, organized.",
      summary:"A shared taxonomy for beer, food, rewards, and locations across both Old Chicago and Rock Bottom's restaurant platforms.",
      roles:["Lead IA","UX Designer"] },

    { slug:"rock-bottom-brewery", category:"Food & Beverage",
      name:"Rock Bottom Restaurant & Brewery", tagline:"One taxonomy. Every taproom, organized.",
      summary:"A shared product taxonomy for beer, food, events, and rewards across Rock Bottom's eleven taprooms.",
      roles:["Lead IA","UX Designer"] },

    { slug:"red-robin-case-study", category:"Food & Beverage",
      name:"Red Robin Gourmet Hamburgers", tagline:"New design. One section. Full flavor.",
      summary:"A focused redesign of one section of Red Robin's site, owned end-to-end from the first sitemap to the final build.",
      roles:["Lead UX Designer","UI Developer"] },

    { slug:"molson-coors", category:"Food & Beverage",
      name:"Molson Coors", tagline:"Two brands. Two neighbors. One purpose.",
      summary:"A post-merger SharePoint migration rebuilding IA and navigation in English and French, so every team felt like one company.",
      roles:["UX Designer","UI Developer"] },

    { slug:"travel-websites-case-study", category:"Travel & Hospitality",
      name:"Trip.com · CheapTickets · Orbitz", tagline:"Three sites. One continuous thread.",
      summary:"Usability testing, competitive analysis, and information architecture carried across three travel brands.",
      roles:["Lead IA","UX Designer"] },

    { slug:"disney-case-study", category:"Travel & Hospitality",
      name:"Disney Weddings, Honeymoons & Meetings", tagline:"Every love story. One magical site.",
      summary:"Rebuilt Disney's Weddings, Honeymoons, and Meetings sites around one taxonomy — organized the way couples actually plan, not how the business was structured.",
      roles:["Lead IA","UX Designer"] },

    { slug:"diginext-case-study", category:"Entertainment & Sports",
      name:"DigiNext", tagline:"One taxonomy. Every screen.",
      summary:"A single responsive taxonomy spanning DigiNext's app, Roku, Prime Video, and Netflix channel — one structure across four navigation conventions.",
      roles:["Lead IA","UX Designer"] },

    { slug:"orlando-magic", category:"Entertainment & Sports",
      name:"Orlando Magic", tagline:"Scouting Application",
      summary:"A SharePoint scouting application that replaced scattered spreadsheets with one tool for tracking prospects, reports, and draft-day player lists.",
      roles:["IA","UX Designer","UI Developer"] },

    { slug:"education-development-center", category:"Education & Nonprofit",
      name:"Education Development Center", tagline:"Many platforms. One place to learn.",
      summary:"A content inventory, classification system, and migration strategy unifying EDC's programs into one platform.",
      roles:["UX Designer","UI Developer"] },

    { slug:"fastsigns", category:"Retail & Franchise",
      name:"FastSigns", tagline:"Eight services. One taxonomy. Zero guesswork.",
      summary:"One taxonomy built around customer needs, unifying eight service lines across 650+ franchise locations.",
      roles:["Lead IA","UX Designer"] }
  ];

  // Preferred display order for categories; anything new sorts alphabetically after these.
  var CATEGORY_ORDER = [
    "Government & Public Sector","Engineering & Industrial","Financial Services",
    "Healthcare & Pharmaceutical","Food & Beverage","Travel & Hospitality",
    "Entertainment & Sports","Education & Nonprofit","Retail & Franchise"
  ];

  function escapeHtml(str){
    return String(str == null ? "" : str).replace(/[&<>"']/g, function(c){
      return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];
    });
  }

  function render(projects){
    var byCategory = {};
    projects.forEach(function(p){
      var cat = p.category || "Other";
      (byCategory[cat] = byCategory[cat] || []).push(p);
    });

    var orderedCats = CATEGORY_ORDER.filter(function(c){ return byCategory[c]; });
    Object.keys(byCategory).sort().forEach(function(c){
      if (orderedCats.indexOf(c) === -1) orderedCats.push(c);
    });

    var html = orderedCats.map(function(cat){
      var items = byCategory[cat];
      var cards = items.map(function(p){
        var roles = (p.roles || []).map(function(r){ return '<span class="tag">' + escapeHtml(r) + '</span>'; }).join("");
        var siteUrl = 'https://' + p.slug + '.netlify.app/';
        return '' +
          '<a class="proj-card" href="' + siteUrl + '" target="_blank" rel="noopener">' +
            '<div class="proj-thumb">' +
              '<img class="proj-img" src="' + siteUrl + 'images/og-image.jpg" alt="' + escapeHtml(p.name) + ' preview" loading="lazy" ' +
                'onerror="this.remove();">' +
            '</div>' +
            '<div class="proj-body">' +
              '<div class="proj-name">' + escapeHtml(p.name) + '</div>' +
              '<div class="proj-tagline">' + escapeHtml(p.tagline) + '</div>' +
              '<p class="proj-desc">' + escapeHtml(p.summary) + '</p>' +
              '<div class="proj-roles">' + roles + '</div>' +
              '<span class="proj-link">View case study <span class="arrow">&rarr;</span></span>' +
            '</div>' +
          '</a>';
      }).join("");
      return '' +
        '<div class="cat">' +
          '<div class="cat-head"><h2 class="display">' + escapeHtml(cat) + '</h2>' +
          '<span class="cat-count">' + items.length + (items.length === 1 ? ' project' : ' projects') + '</span></div>' +
          '<div class="proj-grid">' + cards + '</div>' +
        '</div>';
    }).join("");

    document.getElementById("directory").innerHTML = html;
    document.getElementById("statIndustries").textContent = orderedCats.length;
  }

  // Render immediately from the fallback snapshot so the page is never empty.
  render(PROJECTS);

  // Then try to refresh each card from that project's own skills.json.
  // A "project" block there — { name, category, tagline, summary } — overrides
  // the snapshot; the roles array overrides the role tags. Anything missing,
  // or any project whose site hasn't enabled CORS on skills.json yet, just
  // keeps showing today's snapshot.
  Promise.all(PROJECTS.map(function(p){
    return fetch('https://' + p.slug + '.netlify.app/skills.json', { cache: 'no-store' })
      .then(function(res){ return res.ok ? res.json() : null; })
      .then(function(data){
        if (!data) return { project: p, live: false };
        var proj = data.project || {};
        var merged = {
          slug: p.slug,
          category: proj.category || p.category,
          name: proj.name || p.name,
          tagline: proj.tagline || p.tagline,
          summary: proj.summary || p.summary,
          roles: (Array.isArray(data.roles) && data.roles.length)
            ? data.roles.map(function(r){ return r.roleName; }).filter(Boolean)
            : p.roles
        };
        return { project: merged, live: !!proj.name };
      })
      .catch(function(){ return { project: p, live: false }; });
  })).then(function(results){
    var resolved = results.map(function(r){ return r.project; });
    var liveCount = results.filter(function(r){ return r.live; }).length;
    render(resolved);

    var dot = document.getElementById("syncDot");
    var label = document.getElementById("syncLabel");
    if (liveCount === 0){
      dot.className = "sync-dot";
      label.textContent = "Showing saved snapshot — no live skills.json project data yet";
    } else if (liveCount === results.length){
      dot.className = "sync-dot live";
      label.textContent = "All " + liveCount + " projects synced live from skills.json";
    } else {
      dot.className = "sync-dot partial";
      label.textContent = liveCount + " / " + results.length + " projects synced live — rest showing saved snapshot";
    }
  });