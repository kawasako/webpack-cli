var path = require("path");
var mkdirp = require("mkdirp");
var Generator = require("webpack-fork-yeoman-generator");
var copyUtils = require("../utils/copy-utils");

/**
 * Creates a Yeoman Generator that generates a project conforming
 * to webpack-defaults.
 *
 * @param {any[]} prompts An array of Yeoman prompt objects
 *
 * @param {string} templateDir Absolute path to template directory
 *
 * @param {string[]} copyFiles An array of file paths (relative to `./templates`)
 * of files to be copied to the generated project. File paths should be of the
 * form `path/to/file.js.tpl`.
 *
 * @param {string[]} copyTemplateFiles An array of file paths (relative to
 * `./templates`) of files to be copied to the generated project. Template
 * file paths should be of the form `path/to/_file.js.tpl`.
 *
 * @param {Function} templateFn A function that is passed a generator instance and
 * returns an object containing data to be supplied to the template files.
 *
 * @returns {Generator} A class extending Generator
 */
function webpackGenerator(
	prompts,
	templateDir,
	copyFiles,
	copyTemplateFiles,
	templateFn
) {
	//eslint-disable-next-line
	return class extends Generator {
		prompting() {
			return this.prompt(prompts).then(props => {
				this.props = props;
			});
		}

		default() {
			var currentDirName = path.basename(this.destinationPath());
			if (currentDirName !== this.props.name) {
				this.log(`
				Your project must be inside a folder named ${this.props.name}
				I will create this folder for you.
				`);
				mkdirp(this.props.name);
				var pathToProjectDir = this.destinationPath(this.props.name);
				this.destinationRoot(pathToProjectDir);
			}
		}

		writing() {
			this.copy = copyUtils.generatorCopy(this, templateDir);
			this.copyTpl = copyUtils.generatorCopyTpl(
				this,
				templateDir,
				templateFn(this)
			);

			copyFiles.forEach(this.copy);
			copyTemplateFiles.forEach(this.copyTpl);
		}

		install() {
			this.npmInstall(["webpack-defaults", "bluebird"], {
				"save-dev": true
			}).then(() => {
				this.spawnCommand("npm", ["run", "webpack-defaults"]);
			});
		}
	};
}

module.exports = webpackGenerator;
