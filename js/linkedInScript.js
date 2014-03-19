var skills = new Array();
var companiesIds = new Array(); 
var companiesIdsString = ''; 
var tabCompanies = new Array(); 
var compagnies=new Array();
var skillsString = '';
var compagniesString = '';
var myprofile;
var jsonObject;
var nbResults = [];
var minNbResults = Number.MAX_VALUE;
var fullWindowState;

function change(){
	if(!document.getElementById("generate").disabled){
		document.getElementById("step1").style.display = 'none'; 
		document.getElementById("step3").style.display = 'none'; 
		document.getElementById("step2").style.display = 'block'; 
		document.getElementById("graph").style.display = 'block'; 	
	}
}

function changeBack(){
	document.getElementById("step1").style.display = 'block'; 
	document.getElementById("step2").style.display = 'none'; 
	document.getElementById("graph").style.display = 'none'; 	
}

/* Button  to disconnect from the application */
function disconnect(){
	IN.User.logout();
	document.getElementById("generate").disabled=true;
	changeBack();
}

/*Full screen action*/
function enterFullscreen() {
	var svg = d3.select("svg");
	var buttonfullscreen = d3.select("fullscreen");
	if (!fullWindowState) {
		document.getElementById("fullScreen").disabled=true;
        fullWindowState= true;
		svg.attr("class","graphFullWindow");
		alert("Press '1' to leave Fullscreen mode ");
		document.onkeypress = code_clavier;
		
    } else {
		document.getElementById("fullScreen").disabled=false;
        fullWindowState= false;
		svg.attr("class","graph1");

    }
 }
 
function code_clavier(keyStroke){
			code_eventChooser = (!document.all) ? keyStroke.which : event.keyCode;
			code_which = String.fromCharCode(event.keyCode).toLowerCase();
			if(event.keyCode==49){// Press 1 to leave Fullscreen
				fullWindowState=true;
				enterFullscreen();
			}
}
/* Button full screen*/
 function fullScreen() {
		profHTML="<button id='fullscreen' value='FullScreen' class='btn btn-default' onclick='enterFullscreen()'>FullScreen</button>";
	
		document.getElementById("fullScreen").innerHTML = profHTML;
}
function onLinkedInLoad() {
	IN.Event.on(IN, "auth", onLinkedInLogin);
}
function onLinkedInLogin() {
  // we pass field selectors as a single parameter (array of strings)
  //i'm not log in
	document.getElementById("generate").disabled=false;
	IN.API.Profile("me")
		.fields(["id", "firstName", "lastName", "skills","picture-url","publicProfileUrl"])
		.result(function(result) {
		  loadPage(result.values[0]);
		})
		.error(function(err) {
		  alert(err);
		});
}
			
function loadPage(profile){
	setApply() //NOUVEAU
	setDisconnect(profile);
	fullScreen();
	setDropDown(profile);
	setCompagnies();
	myprofile=profile;

	jsonObject = {
        "name": myprofile.firstName+" "+myprofile.lastName,
        "id": "root",
		"pictureUrl": myprofile.pictureUrl,
        "type": "image",
		"distance": 0
    };

    jsonObject.children = [];
    callResearchSizeNode(0, profile);
}

/* Function to resize nodes size according of the number of people having that skill */
function callResearchSizeNode(indexSkills, profile){
	IN.API.PeopleSearch()
		.fields("id")
		.params({"keywords": profile.skills.values[indexSkills].skill.name})
		.result(function(result) {
			nbResults[indexSkills] = result.numResults;
			if(result.numResults < minNbResults){
				minNbResults = result.numResults;
			}	
			indexSkills++;
			if(indexSkills < profile.skills.values.length){
				callResearchSizeNode(indexSkills, profile);
			}
			else{
				if(minNbResults == 0) minNbResults = 1;
				for (var i=0; i<profile.skills.values.length; i++){
					jsonObject.children[i] = {
			            "name": profile.skills.values[i].skill.name,
			            "group": i,
			            "id": profile.skills.values[i].skill.name.replace(" ", "_"),
			            "type": "circle",
			            "nodesize": Math.min(4*nbResults[i]/minNbResults, 25),
			            "text": nbResults[i]
			        };	
				}
				ICEjs(jsonObject);
				spinner.stop();
				if(document.getElementById("step2").style.display == 'block')
					document.getElementById("graph").style.display = 'block';
			}
		})
		.error(displayPeopleSearchError);
}
			
function skillsToString(){
	skillsString = '';
	for(var i=0; i<skills.length; i++){
		skillsString += skills[i].toString()+" ";
	}	
}
function compagniesToString(){
	compagniesString = '';
	for(var i=0; i<compagnies.length; i++){
		compagniesString += compagnies[i].toString()+" ";
	}	
}

function checkSkill(checkBoxSkill){
	if(checkBoxSkill.checked ){
		skills.push(checkBoxSkill.value);
	}
	else{
		if(skills.indexOf(checkBoxSkill.value) != -1){
			skills.splice(skills.indexOf(checkBoxSkill.value),1);
		}
	}
	skillsToString();
	d3.select("svg").remove();
	IN.API.PeopleSearch()
		.fields(["id", "firstName", "lastName", "pictureUrl", "positions:(company:(name))","publicProfileUrl"])
        .params({"keywords": skillsString})
        .result(callResearch)
        .error(displayPeopleSearchError); 
}
			

function setDisconnect(profile) {
	if (!profile) {
		profHTML = "<p>You are not logged in</p>";
	}
	else {
		profHTML = "<input type='button' value='Disconnect' class='btn btn-default' onClick='disconnect()'></input>";
	}
	document.getElementById("disconnect").innerHTML = profHTML;
}

 /* DropDown of skills*/
function setDropDown(profile){	
		var tab = [];
		var isChecked=false;
		for (var i=0; i<profile.skills.values.length; i++){
		tab[i] ={ id: i, label: profile.skills.values[i].skill.name, isChecked: false };
		}
		
	  $('.myDropdownCheckboxBasic').dropdownCheckbox({
	    data: tab,
	    autosearch: true,
	    title: "Skills",
	    hideHeader: false,
	    showNbSelected: true,
	    btnClass: 'btn btn-primary'
	  });  
	
}
/* DropDown of compagnies*/
function setCompagnies(){	
	tabCompanies = [
	    //id corresponds to the company id on linkedin
		//http://developer.linkedin.com/apply-getting-started#company-lookup
	    { id: "264431", label: "Icc-cpi.int", isChecked: false },
	    { id: "166426", label: "Worldbankgroup.org", isChecked: false },
	    { id: "166589", label: "Unhcr.org", isChecked: false },
	    { id: "1860", label: "Unwomen.org", isChecked: false },
	    { id: "24960", label: "Unv.org", isChecked: false },
	    { id: "165390", label: "Paho.org", isChecked: false },
	    { id: "2857210", label: "Esm.europa.eu", isChecked: false },
	    { id: "538299", label: "Unccd.int", isChecked: false },
	    { id: "11312", label: "Oas.org", isChecked: false },
	    { id: "12578", label: "Unops.org", isChecked: false },
	    { id: "13904", label: "Iaea.org", isChecked: false },
	    { id: "3136", label: "Redcross.org", isChecked: false },
	    { id: "18122", label: "Intracen.org", isChecked: false },
		{ id: "12149", label: "Ifrc.org", isChecked: false },
	    { id: "163765", label: "Fao.org", isChecked: false },
		{ id: "24960", label: "Unvolunteers.org", isChecked: false },
		{ id: "124959", label: "Unon.org", isChecked: false },
		{ id: "164282", label: "Icrc.org", isChecked: false },
		{ id: "735841", label: "Unwto.org", isChecked: false },
		{ id: "30706", label: "Unece.org", isChecked: false },
		{ id: "15088", label: "Unaids.org", isChecked: false },
		{ id: "166588", label: "Unesco.org", isChecked: false },
		{ id: "439511", label: "Itu.int", isChecked: false },
		{ id: "33118", label: "Ctbto.org", isChecked: false },
		{ id: "32548", label: "Theglobalfund.org", isChecked: false },
		{ id: "57308", label: "Unicc.org", isChecked: false },
		{ id: "4783", label: "Ifc.org", isChecked: false },
		{ id: "166426", label: "Worldbank.org", isChecked: false },
		{ id: "5350", label: "Who.int", isChecked: false },
		{ id: "165285", label: "Oecd.org", isChecked: false },
		{ id: "166970", label: "Wfp.org", isChecked: false },
		{ id: "35503", label: "Unfccc.int", isChecked: false },
		{ id: "1861", label: "Undp.org", isChecked: false },
		{ id: "26481", label: "Ohchr.org", isChecked: false },
		{ id: "16831", label: "Ifad.org", isChecked: false },
		{ id: "1860", label: "Un.org", isChecked: false },
		{ id: "164314", label: "Ilo.org", isChecked: false },
		{ id: "4881", label: "Unicef.org", isChecked: false },
		{ id: "164447", label: "Iom.int", isChecked: false },
		{ id: "19238", label: "Abs.gov.au", isChecked: false },
		{ id: "17550", label: "Istat.it", isChecked: false },
		{ id: "164401", label: "Iadb.org", isChecked: false },
		{ id: "9360", label: "Eib.org", isChecked: false },
		{ id: "23392", label: "Isdb.org", isChecked: false },
		{ id: "33214", label: "Coebank.org", isChecked: false },
		{ id: "1738071", label: "Ebrd.com", isChecked: false },
		{ id: "13978", label: "Nib.int", isChecked: false },
		{ id: "81562", label: "Afdb.org", isChecked: false },
		{ id: "5947", label: "Adb.org", isChecked: false },
		
	  ];

	  $('.checkBoxCompagnies').dropdownCheckbox({
	    data: tabCompanies,
	    autosearch: true,
	    title: "Companies",
	    hideHeader: false,
	    showNbSelected: true,
	    btnClass: "btn btn-primary"
	  });	 
}

function fullScreen() {
		var graph = document.getElementById("graph");
		
		profHTML = "<input type='button' value='FullScreen' class='btn btn-default' onClick='enterFullscreen(graph);'></input>";

	document.getElementById("fullScreen").innerHTML = profHTML;
}


function displayConnectionsErrors(error) { /* do nothing */ }

function displayPeopleSearchError(error) { 

	document.getElementById("generate").style.display = 'none';
	document.getElementById("step3").style.display = 'block'; 
	
}	


/* Function of D3js displays graph of nodes and links */	
var root;
var force;
var svg;
var link;
var node;	
var target;
var spinner;	
function ICEjs(jsonObject){
	var width = 960,
		height = 500;

	force = d3.layout.force()
		.linkDistance(function(d) { return d.target.distance==1 ? 50 : d.target.distance==2 ? 150 : 100; })
		.charge(-900)
		.gravity(.05)
		.size([width, height])
		.on("tick", tick);

		svg = d3.select("#step2").append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("class","graph1")
			.attr("id", "graph");

		link = svg.selectAll(".link");
		node = svg.selectAll(".node");

	  	root = jsonObject;
	  	update();
}

function update() {
	var color = d3.scale.category20();
	var nodes = flatten(root),
	links = d3.layout.tree().links(nodes);

  	// Restart the force layout.
  	force
	  .nodes(nodes)
	  .links(links)
	  .start();

  	// Update links.
  	link = link.data(links, function(d) { return d.target.id; });
	link.exit().remove();
	link.enter().insert("line", ".node")
	  .attr("class", "link");

  	// Update nodes.
  	node = node.data(nodes, function(d) { return d.id; });
	node.exit().remove();

	d3.selectAll("input[value=ShowMore]")
	  .on("click", clickButton);  

	d3.selectAll("input[value=ShowLess]")
	  .on("click", HideClickButton);
	  
	d3.selectAll("div[class=layout]")
	  .on("click", clickSkill);

	var nodeEnter = node.enter().append("g")
	  .attr("class", "node")
	  .attr("id", function(d){return d.id})
	  .on("click", click)
	  .call(force.drag);
	  
	var div = d3.select("body").append("div")   
		.attr("class", "tooltip")               
		.style("opacity", 0); 

	nodeEnter.filter(function(d) { return d.type == "circle" }).append("circle")
	  .attr("class", function(d) { return d.type })
	  .attr("r", function(d) { return d.nodesize })
	  .style("fill", function(d) { return color(d.group); });

	  
	nodeEnter.filter(function(d) { return d.type == "image" }  ).filter(function(d){return d.id == "root"}).append("image")
	  .attr("xlink:href", function(d) { return d.pictureUrl || "http://s.c.lnkd.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_60x60_v1.png" })
	  .attr("class", function(d) { return d.type })
	  .attr("x", -8)
	  .attr("y", -8)
	  .attr("width", 50)
	  .attr("height", 50)
	  
	nodeEnter.filter(function(d) { return d.type == "image" }  ).filter(function(d){return d.id != "root"}).append("image")
	  .attr("xlink:href", function(d) { return d.pictureUrl || "http://s.c.lnkd.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_60x60_v1.png" })
	  .attr("class", function(d) { return d.type })
	  .attr("x", -8)
	  .attr("y", -8)
	  .attr("width", 50)
	  .attr("height", 50)
	  .on("mouseout", function(d){ div.transition()
		.delay(2000)
	    .duration(1000)
		.style("pointer-events","none")
		.style("opacity", 0)})
	  .on("mouseover", function(d){  div.transition()
		.duration(200)
		.style("opacity", .9)
		.style("left", (d3.event.pageX) + "px")
		.style("top", (d3.event.pageY - 28) + "px") 
		.style("pointer-events","auto")
		div .html("<p> "+d.name+" </p> <p>  "+d.company+"</p> <a id=\"profile\" href=\""+d.urlprofile+"\" target=\"_blank\" class =\"btn btn-primary btn-lg\" \" >See profile</a>")}) 
	  

	nodeEnter.filter(function(d) { return d.type == "circle" }).append("text")
	  .attr("class", "skills")
	  .attr("dx", function(d) { return d.nodesize+5 })
	  .attr("dy", ".35em")
	  .text(function(d) { return d.name+" ("+d.text+")" });

	nodeEnter.filter(function(d) { return d.type == "image" }).append("text")
	  .attr("class", "name")
	  .attr("dx", 48)
	  .attr("dy", "1.15em")
	  .style("fill", "#0079AB")
	  .text(function(d) { return d.name });

	nodeEnter.filter(function(d) { return d.type == "image"}).append("text")
	  .attr("class", "company")
	  .attr("dx", 48)
	  .attr("dy", "2.90em")
	  .style("fill", "#666")
	  .text(function(d) { return  d.company });

	
}

function tick() {
	link.attr("x1", function(d) { return d.source.x; })
	  .attr("y1", function(d) { return d.source.y; })
	  .attr("x2", function(d) { return d.target.x; })
	  .attr("y2", function(d) { return d.target.y; });

  	node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}

function color(d) {
	return d._children ? "#3182bd" // collapsed package
	  : d.children ? "#c6dbef" // expanded package
	  : "#fd8d3c"; // leaf node
}

// Toggle children on click.
function click(d) {
	if (typeof d.children === 'undefined' && d.distance !== 1 && d.distance !== 2){
		if (d3.event.defaultPrevented) return; // ignore drag
		else{
			var checkboxes = d3.selectAll("div[class=layout]")[0];
			checkboxes[d.group].firstElementChild.checked = true;
			callResearch(d.group, myprofile);
		}
	}
	else{	
		if (d3.event.defaultPrevented) return; // ignore drag
		if (d.distance === 1 || d.distance === 2){ // if a leaf node is selected
			var parentNode = (d3.select('#'+d.parentId)[0])[0].__data__; //get the parent node of the selected node
			
			if(!parentNode._children){
				parentNode._children = parentNode.children.slice(); //if it's the first time a child node is removed we save all the children to be able to make them reappear later
			}
			
			var i=0;
			var childFound = false;
			while(i < parentNode.children.length && !childFound){
				if(parentNode.children[i].id === d.id){
					parentNode.children.splice(i,1);
					childFound = true;
				}
				i++;
			}
			
			update();
			return;
		}
	  	if (d.children) {
			if(!d._children){
				d._children = d.children;
			}
			d.children = null;
	  	} 
	  	else {
			var checkboxes = d3.selectAll("div[class=layout]")[0];
			checkboxes[d.group].firstElementChild.checked = false;
			d.children = d._children;
			d._children = null;
	  	}
	  	update();
  	}
  	
}
// Click on button ShowMore
function clickButton() {
	if (d3.event.defaultPrevented) return; 
	
	if(!jsonObject.children) {
	
		jsonObject.children = jsonObject._children;
		jsonObject._children = null;	
		
  	}
	update();
	
}
// Click on button ShowLess
function HideClickButton(){
	if (d3.event.defaultPrevented) return; 
	
	if (jsonObject.children) {
	
		jsonObject._children = jsonObject.children;
		jsonObject.children = null;
  	} 
  	
  	update();
}

function clickSkill(){
	if (d3.event.defaultPrevented) return;
		if(d3.event.target.textContent){
			var skillName = d3.event.target.textContent;
			var Index;
			var i = 0;
			var indexFound = false;
			
			//we search the index of the selected skill
			while(i<root.children.length && !indexFound){
				if(root.children[i].name === skillName){
					Index = i;
					indexFound = true;
				}
				i++;
			}
			
			//if an index has been found then the element clicked is a skill otherwise it's a company
			if(indexFound){
				if(typeof root.children[Index].children === 'undefined'){
					callResearch(Index,myprofile);
				}
				else{
					if(root.children[Index].children){
						if(!root.children[Index]._children){
							root.children[Index]._children = root.children[Index].children;
						}
						root.children[Index].children = null;
					}
					else{
						root.children[Index].children = root.children[Index]._children;
						root.children[Index]._children = null;
					}
				}
				
				update();
			}
		}
}

function setApply(){
	profHTML = "<input type='button' value='Apply Changes' class='btn btn-default' onClick='applyButton()'></input>";
	document.getElementById("apply").innerHTML = profHTML;
}

function applyButton(){
	//check the companies drop down
	companiesIds = [];
	var checkboxes = d3.selectAll("div[class=layout]")[0];
	for(var i = skills.length; i< checkboxes.length; i++){
		if(checkboxes[i].firstElementChild.checked == true){
			companiesIds.push(tabCompanies[i-skills.length].id);
		}
	}
	IdsToString();
	d3.select("svg").remove();
	target = document.getElementById('step2');
	spinner = new Spinner().spin();
	target.appendChild(spinner.el);
	callResearchSizeNode(0, myprofile);
}

function IdsToString(){
	compagniesIdsString = '';
	if(companiesIds.length != 0){
		companiesIdsString += ',';
		for(var i=0; i<companiesIds.length-1; i++){
			companiesIdsString += companiesIds[i].toString()+",";
		}
		companiesIdsString += companiesIds[i].toString();
	}
}

// Returns a list of all nodes under the root.
function flatten(root) {
	var nodes = [], i = 0;

	function recurse(node) {
		if (node.children) node.children.forEach(recurse);
		if (!node.id) node.id = ++i;
		nodes.push(node);
  	}
  recurse(root);
  return nodes;
}
/*Function assigns children nodes with their fields*/
function callResearch(indexSkills, profile){
	IN.API.Raw("/people-search:(people:(id,first-name,last-name,picture-url,positions:(company:(name)),public-profile-url,distance),facets:(code,buckets:(name,code,count)))?keywords="+profile.skills.values[indexSkills].skill.name+"&facet=current-company"+companiesIdsString+"&current-company=true")
				.result(function(result) {
					var members = result.people.values;
					indexChild=0;
					jsonObject.children[indexSkills].children = [];
					for (var member in members) {
						if(members[member].firstName != "private" || members[member].lastName != "private"){
							if (typeof members[member].positions === 'undefined' || members[member].positions === null || typeof members[member].positions.values === 'undefined' || members[member].positions.values === null) {
								jsonObject.children[indexSkills].children[indexChild] = {
									"name": members[member].firstName + " " + members[member].lastName,
									"id": members[member].firstName + "_" + members[member].lastName.replace(" ", "_")+indexSkills+indexChild,
									"company": "",
									"pictureUrl": members[member].pictureUrl,
									"type": "image",
									"urlprofile": members[member].publicProfileUrl,
									"distance": members[member].distance,
									"parentId": profile.skills.values[indexSkills].skill.name.replace(" ", "_")
								};
							}
							else{
								jsonObject.children[indexSkills].children[indexChild] = {
									"name": members[member].firstName + " " + members[member].lastName,
									"id": members[member].firstName + "_" + members[member].lastName.replace(" ", "_")+indexSkills+indexChild,
									"company": members[member].positions.values[members[member].positions.values.length-1].company.name,
									"pictureUrl": members[member].pictureUrl,
									"type": "image",
									"urlprofile": members[member].publicProfileUrl,
									"distance": members[member].distance,
									"parentId": profile.skills.values[indexSkills].skill.name.replace(" ", "_")
								};	
							}
							indexChild++;
						}
					}
					update();
				})
				.error(displayPeopleSearchError);
}

			