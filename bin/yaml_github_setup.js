#!/usr/bin/env node
"use strict";

var program = require('commander'),
    fs = require('fs'),
    yaml = require('js-yaml');


var help = 'Parse YAML files and generate jenkins job configs. \
Must have the format:\
-\
  name: REPO_NAME\
  url: REPO_URL\
';

program.version('iunno')
       .description(help)
       .option('-o, --output <path>', 'File to output to.')
       .option('-f, --force', 'If --output exists, force overwrite (program just exits by default).')
       .parse(process.argv);

if (!program.output) {
  console.log('--output required');
  process.exit(1);
}

var repos = [];

program.args.forEach(function(file) {
  var data = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
  data.forEach(function(repo) {
    if (!repo.url || !repo.name) {
      console.log('Repo not formatted correctly: ' + repo);
      process.exit(1);
    }
    var obj = {
      name: repo.name,
      url: repo.url,
      token: 'REPLACE_ME'
    };
    repos.push(obj);
  });
  fs.exists(program.output, function(fileExists) {
    if (program.force || !fileExists) {
      fs.writeFile(program.output, JSON.stringify(repos), function(err) {
        console.log( (err === null ? 'Wrote ' : err + '\n\nFailed writing ') + 'to ' + program.output );
        process.exit(!!err);
      });
    }
    else {
      console.log(program.output + ' already exists! Use --force (-f) to force overwrite.');
      process.exit(1);
    }
  });
});
