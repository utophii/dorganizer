# dorganizer

A local CLI utility that monitors the downloads folder and
automatically organizes files from its root into subfolders based on
extension (pdf/, jpg/, archives/, no-extension/, etc.).

## Installation and Build

npm install
npm run build

## Start

npm run start
# or after npm link / npm install -g .
dorganizer

## Parameters

dorganizer --dir "~/Desktop/Test Downloads"
dorganizer --help

## Stop

Ctrl+C

## Log

All actions and errors are written to a hidden file in the watched folder:

<folder>/.dorganizer.log