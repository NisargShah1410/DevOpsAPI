let axios = require("axios");
let fs = require("fs");
let writeableProjStream = fs.createWriteStream("projects.json");
let writeableUserStream = fs.createWriteStream("repo.json");

require("dotenv").config();
var express = require('express');
var app = express();

let projnames={names: []};
let projectid = {names: []}; 
//let activeuser =0;
//let checkuser = "Saurabh Rai";

async function azprojectrepo(){
  const accessToken = process.env.AZURE_DEVOPS_TOKEN;
  let organization= "DevOps-MBU";
  let url = `https://dev.azure.com/${organization}/_apis/projects?api-version=6.0`;
  
  if (accessToken == null || accessToken === "") {
    throw new Error("Please provide an access token");
  } else {
    console.log("Token is present!");
  }
  
  const request = await axios({
    url,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // This!
      Authorization: `Basic ${Buffer.from(`PAT:${accessToken}`).toString(
        "base64"
      )}`,
      "X-TFS-FedAuthRedirect": "Suppress",
    },
  });
  let responsedata = request.data;
  let valuesArr = responsedata.value;
  
  valuesArr.forEach(obj => {
    projnames.names.push(obj.name);
  });
  writeableProjStream.write(JSON.stringify(projnames, null, 2), "UTF8");
  writeableProjStream.end();
    writeableProjStream.on("finish", function () {
    console.log("write completed");
  });
  console.log('\n');

//Looping through all project test runs to see if user active or not
  for(let i=0; i<projnames.names.length; i++){
    console.log("Project Name : "+projnames.names[i]);
    let organization= "DevOps-MBU";
    let project= projnames.names[i];
    let url = `https://dev.azure.com/${organization}/${project}/_apis/test/runs?includeRunDetails=true&api-version=6.0`;
    const request = await axios({
      url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // This!
        Authorization: `Basic ${Buffer.from(`PAT:${accessToken}`).toString(
          "base64"
        )}`,
        "X-TFS-FedAuthRedirect": "Suppress",
      },
    });
    let responsedata = request.data;
    let valuesArr = responsedata.value;
    valuesArr.forEach(obj =>{ 
      console.log(obj.owner.displayName)
      if(obj.owner.displayName === checkuser){
        activeuser =1;
      }
    });
  }
  
  if(activeuser){
    console.log(checkuser+ " is a active user");
  }else{
    console.log(checkuser+ " is not a active user");
  }
}
azprojectrepo();
