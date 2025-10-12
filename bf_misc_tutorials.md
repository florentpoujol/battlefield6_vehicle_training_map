# BF6 Portal misc tutorials and tips

## Youtube and other websites

- there is a Portal channel on the official Battlefield Discord : https://discord.com/channels/140933721929940992/907670155125989456
- and an (for now empty) subreddit : https://www.reddit.com/r/Battlefield6PortalSDK/
- Two Youtube channels to follow
	- Battlefield Portal Hub : https://www.youtube.com/channel/UCEqGivH3VeJFsF7jnUWOTTw
	- Matavatar : https://www.youtube.com/@Matavatar/videos
		- videos will likely be in French, but the Battlefield Portal Hub has a translation for the introductory video
- https://bfportal.gg/ (and a dedicated Discord)


## In Godot

- For objects dragged from the Object library to stick to the terrain : in the Scene tree view, show terrain "modifiable children" to reveal the mesh, then again on the mesh to reveal the Terain, select then above the editor view, click "Mesh", then "create collision shape" then (first menu entry) then in "collision shape placement", select "static body child", then click the create button
	- now we you will add an object from the library it will touch the ground
	- the same can be done for the Assets
- Shift + G to place the selected object where the mouse is
- Ctrl + D to duplicate the current object (the name of the object will automatically be suffixed with a number, or the number suffix will be increased)
- blue arrow on the gizmo will usually be the front of the object
- press W, E to change the mode of the gizmo
- press T to toggle the Gizmo between local and global space
	- in local space the blue array is the front of the object