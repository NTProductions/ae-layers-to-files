var globalExportFolder = File("~/Documents/filesToLayersLastSavedLocation.ftl");
var globalFolderPath;
if(globalExportFolder.exists) {
    globalExportFolder.open("r");
    globalFolderPath = globalExportFolder.read();
    globalExportFolder.close();
    }

var window = new Window("palette", "Layers to Files", undefined);
window.orientation = "column";

var groupOne = window.add("group", undefined, "groupOne");
groupOne.orientation = "row";
var locationText = groupOne.add("statictext", undefined, "Export Folder");

var locationEditText = groupOne.add("edittext", undefined, "Export Folder Location");
if(globalFolderPath != null) {
        locationEditText.text = globalFolderPath;
    }
locationEditText.size = [250, 25];
var locationButton = groupOne.add("button", undefined, "...");
locationButton.size = [25, 25];

// export options
var groupTwo = window.add("group", undefined, "groupTwo");
groupTwo.orientation = "row";
var formatDD = groupTwo.add("dropdownlist", undefined, ["JPG", "PNG"]);
formatDD.selection = 1;
var exportButton = groupTwo.add("button", undefined, "Export");


window.center();
window.show();

locationButton.onClick = function() {
    var outputFolder = new Folder;
    outputFolder = outputFolder.selectDlg("Select a folder to output layers to");
    //alert(outputFolder);
    if(outputFolder != null) {
        locationEditText.text = outputFolder.fsName.replace(/%20/g, " ");
        if(!globalExportFolder.exists) {
            globalExportFolder.open("w");
            globalExportFolder.write(locationEditText.text);
            globalExportFolder.close();
            }
        } else {
           alert("No valid folder selected");
           return false;
            }
    }

exportButton.onClick = function() {
        if(!Folder(locationEditText.text).exists) {
            alert("Please select a valid export folder first");
            return false;
            }
        
        if(app.project.activeItem == null || !(app.project.activeItem instanceof CompItem)) {
            alert("Please select a composition");
            return false;
            }
        
        var ogComp = app.project.activeItem;
        
        var dummyComp = app.project.items.addComp("dummyComp", 1920, 1080, 30, 1, 30);
        var dummyRQItem = app.project.renderQueue.items.add(dummyComp);
        var jpgBool, pngBool;
             var module = dummyRQItem.outputModule(1);
            
            var templates = module.templates;
            jpgBool = false;
            pngBool = false;
            for(var r = 0; r < templates.length; r++) {
                if(templates[r].toLowerCase().indexOf("jpg") != -1) {
                    jpgBool = true;
                    }
                if(templates[r].toLowerCase().indexOf("png") != -1) {
                    pngBool = true;
                    }
                }
            
            dummyComp.remove();
            
            ogComp.openInViewer();
            
            if(formatDD.selection.index == 0 && jpgBool == false) {
                alert("Please create a render preset with the name 'JPG'");
                return false;
                }
            
            if(formatDD.selection.index == 1 && pngBool == false) {
                alert("Please create a render preset with the name 'PNG'");
                return false;
                }
        
            main(locationEditText.text, formatDD.selection.index);
        
            globalExportFolder.open("w");
            globalExportFolder.write(locationEditText.text);
            globalExportFolder.close();
    }

function main(exportFolderPath, formatInt) {
    // formatInt == 0 JPG
    // formatInt == 1 PNG
    
    app.beginSuppressDialogs();
    
    var comp = app.project.activeItem;
    comp.workAreaStart = comp.time;
    comp.workAreaDuration = comp.frameDuration;
    
    var rqItem, templates;
    var previousLayer;
    
    for(var i = 1; i <= comp.numLayers; i++) {
        if(comp.layer(i).nullLayer == false && comp.layer(i).adjustmentLayer == false && comp.layer(i).property("ADBE Light Options Group") == null && comp.layer(i).property("ADBE Camera Options Group") == null) {
            if(previousLayer) {
            previousLayer.solo = false;
            }
            comp.layer(i).solo = true;
            rqItem = app.project.renderQueue.items.add(comp);
            var module = rqItem.outputModule(1);
            if(formatInt == 0) {
                module.applyTemplate("JPG");
                module.file = File(exportFolderPath+"/"+comp.name+"_"+comp.layer(i).name+"_[#####]_"+generateRandomNumberString(3)+".jpg");
                } else {
                 module.applyTemplate("PNG");
                 module.file = File(exportFolderPath+"/"+comp.name+"_"+comp.layer(i).name+"_[#####]_"+generateRandomNumberString(3)+".png");
                    }
            
            app.project.renderQueue.render();
            previousLayer = comp.layer(i);
            }
        }
    previousLayer.solo = false;
    comp.openInViewer();
    
    app.endSuppressDialogs(false);
    }

function generateRandomNumberString(numChars) {
    var string = "";
        for(var r = 1; r <= numChars; r++) {
            string+=(Math.floor(Math.random() * 9));
            }
        return string;
    }