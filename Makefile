# Basic Makefile
NAME = fancy-tiling
UUID = $(NAME)@devroamer.zen
ZIP = $(UUID).shell-extension.zip
BASE_MODULES = metadata.json extension.js prefs.js README.md LICENSE stylesheet.css
EXTRA_DIRECTORIES = resources src


ifeq ($(strip $(DESTDIR)),)
	INSTALLTYPE = local
	INSTALLBASE = $(HOME)/.local/share/gnome-shell/extensions
else
	INSTALLTYPE = system
	SHARE_PREFIX = $(DESTDIR)/usr/share
	INSTALLBASE = $(SHARE_PREFIX)/gnome-shell/extensions
endif
INSTALLNAME = fancy-tiling@devroamer.zen

# The command line passed variable VERSION is used to set the version string
# in the metadata and in the generated zip-file. If no VERSION is passed, the
# version is pulled from the latest git tag and the current commit SHA1 is 
# added to the metadata
ifdef VERSION
	FILESUFFIX = _v$(VERSION)
else
	COMMIT = $(shell git rev-parse HEAD)
	VERSION = 
	FILESUFFIX =
endif

clean:
	rm -rf ./build

install: zip-file
	gnome-extensions install -f $(ZIP)

enable:
	gnome-extensions enable $(UUID)

disable:
	gnome-extensions disable $(UUID)

zip-file: build
	cd build ; \
	gnome-extensions pack -f \
		--extra-source=./resource \
		--extra-source=./metadata.json \
		--extra-source=./stylesheet.css \
		--extra-source=./README.md \
		--extra-source=./LICENSE \
		--extra-source=./src \
		--schema=../schemas/org.gnome.shell.extensions.$(NAME).gschema.xml \
		--podir=../po \
		$(OUT_DIR) \
		-o ../
	-cd ..
	-rm -rf ./build

pot:
	rm -f po/LINGUAS
	find resources/ui -iname "*.ui" -printf "%f\n" | sort | \
		xargs xgettext --directory=resources/ui --output=po/$(UUID).pot \
		--from-code=utf-8 --package-name=$(UUID)

	for l in $$(ls po/*.po); do \
		basename $$l .po >> po/LINGUAS; \
	done

	cd po && \
	for lang in $$(cat LINGUAS); do \
    	mv $${lang}.po $${lang}.po.old; \
    	msginit --no-translator --locale=$$lang --input $(UUID).pot -o $${lang}.po.new; \
    	msgmerge -N $${lang}.po.old $${lang}.po.new > $${lang}.po; \
    	rm $${lang}.po.old $${lang}.po.new; \
	done

build:
	-rm -fR ./build
	mkdir -p build
	cp $(BASE_MODULES) $(EXTRA_MODULES) build
	cp -r $(EXTRA_DIRECTORIES) build

ifneq ($(COMMIT),)
	sed -i '/"version": .*,/a "commit": "$(COMMIT)",'  build/metadata.json;
else ifneq ($(VERSION),)
	sed -i 's/"version": .*,/"version": $(VERSION),/'  build/metadata.json;
endif

test: install enable
	env GNOME_SHELL_SLOWDOWN_FACTOR=2 \
		MUTTER_DEBUG_DUMMY_MODE_SPECS=1920x1080 \
		dbus-run-session -- gnome-shell --nested --wayland