.DEFAULT: build

build: build_prod dir_process

install:
	npm install

remove_modules:
	rm -rf ./node_modules

dev:
	npm run dev

build_prod:
	npm run build

clean:
	rm -rf ./panel

dir_process: clean
	mkdir panel
	mkdir panel/public
	mkdir panel/public/admin
	mkdir panel/templates
	mv ./dist/index.html ./panel/templates/
	mv ./dist/* ./panel/public/admin/
