# Mark PDF Action

This github action adds the specified text to a specified PDF. 
Text is printed on the bottom margin of the first page. 
The sha is automatically added.


## Code in `main` and modify the action

- Install the dependencies `npm install`
- The `action.yml` defines the inputs and output for the action.
- The `index.js` contains the code for the action.

## Package for distribution

GitHub Actions will run the entry point from the action.yml. 
Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules. 
The packaged action is in the `dist` folder.

```bash
npm run prepare
```

## Create a release branch

Users shouldn't consume the action from `main` since that would be latest code and actions can break compatibility between major versions.
Use `v1` release branch:

```bash
git checkout -b v1
git commit -a -m "v1 release"
```

```bash
git push origin v1
```

## Usage

You can now consume the action by referencing the `v1` branch.
The following workflow is triggered by a tag and will compile a `.tex` file to produce a PDF, mark the document with the git reference information and then produce a github release.

```yaml
name: Tagged release

on:  
  push:
    tags:
      - "*"
  workflow_dispatch:

permissions:
  contents: write

env:
  out_file: '${{ github.event.repository.name }}.pdf'

jobs:
  typeset_release:
    runs-on: ubuntu-latest
    name: Mark and release
    steps:
      - name: Checkout 
        uses: actions/checkout@v3
      - name: Process LaTeX document
        uses: xu-cheng/latex-action@v2
        with:
          root_file: main.tex
      - name: Mark text onto pdf
        uses:  oliver-butterley/mark-pdf-action@v1
        with:
          in_file: 'main.pdf'
          out_file:  ${{ env.out_file }}
          text: 'repo: ${{ github.repository }}, ref:  ${{ github.ref_name }}'
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        if: ${{ !startsWith(github.ref, 'refs/tags/') }}
        with:
          name: draft
          path: ${{ env.out_file }}
      - name: Release
        uses: softprops/action-gh-release@v1
        if: ${{ startsWith(github.ref, 'refs/tags/') }}
        with:
          files:  ${{ env.out_file }}
```        

## To do

- Updated version using typescript and recommended practices [https://github.com/actions/typescript-action/tree/main].
- Add boolean input for the action to choose display of sha.
- Provide easy options for the positioning of the text on the PDF.