# Snap

A game

## Documentation

### **root**

##### **properties**

>**currentGame** 
**`game`** *current instance of game*

>**debug** 
**`object`** *useful tools for debugging*

>**utility** 
**`object`** *miscellaneous useful methods*

>**gameObject** 
**`object`** *contains definitions for gameObjects*

>**physics** 
**`object`** *contains definitions for physicsObjects*

>**logic** 
**`object`** *contains definitions for game logic*

>**camera** 
**`object`** *contains definitions for camera*

>**character** 
**`object`** *contains definition for character*

>**stage** 
**`object`** *contains definitions for stage*

##### **static methods**

>**init** 
**`method`** *instantiates a game*

### **game**

##### **properties**

>**stage** 
**`stage`** *instance of stage*

>**camera** 
**`stage`** *instance of camera*

>**character** 
**`stage`** *(temporary) instance of player-controlled character*

>**logic** 
**`logic`** *instance of logic engine*

### **stage**

##### **properties**

>**size** 
**`vector2`** `{x,y}` *size of world*

>**center** 
**`vector2`** `{x,y}` *returns center of world*

>**physics** 
**`physics`** *instance of physics engine*

>**renderer** 
**`renderer`**  *instance of renderer engine*

##### **methods**

>**add(gameObject)** 
**`method`**  *adds a gameObject to the stage*
_(stub)_
 >  - **gameObject**
    **`gameObject`** *Object to add *

### **camera**

##### **new camera(obj)**

##### **properties**

>**location** 
**`vector2`** `{x,y}` *location of camera*

##### **methods**

>**follow(obj)** 
**`method`** *follow a specified gameObject*
 >  - **obj.target**
    **`gameObject`** *Object to follow *

### **character**

##### **properties**

>**gameObject** 
**`gameObject`** *the object that represents the character*

>**controller** 
**`object`** *player-controller for the character*


##### **methods**

>**collisionHandler(e)** 
**`method`** *runs when collision with the character occurs*
 >  - **e**
    **`event`** *collision information*

### **collection**
##### **properties**

>**map** 
**`map`** *associated map object for saving attached blocks*

>**controller** 
**`object`** *player-controller for the character*


##### **methods**

>**addBlock(obj)** 
**`method`** *adds a block, only if the specified coordinate does not already have one*
 >  - **obj.position**
    **`vector2`** *position of new block*
     >  - **obj.delay**
    **`integer`** *in milliseconds, the time before the new block gets added.*
    
>**exists(obj)** 
**`method`** *tests whether a block exists a location*
 >  - **obj**
    **`vector2`** *position to test for*

### **map**

##### **methods**

>**add(obj)** 
**`method`** *adds a block, only if the specified coordinate does not already have one*
 >  - **obj.gameObject**
    **`gameObject`** *block to add*
>  - **obj.position**
    **`vector2`** *location of new block*
    
>**get(obj)** 
**`method`** *gets a block*
 >  - **obj**
    **`vector2`** *position to test for*

### **gameObject**

#### genericObject

##### **properties**

>**position** 
**`vector2`** `{x,y}` *gets or sets the position*

>**rotation** 
**`number`**  *gets or sets the rotation*


##### **methods**

>**remove()**
**`method`** *remove the gameObject from the world* 



#### block *extends genericObject*

##### **new block(obj)**
>**obj.blockSize** 
**`integer`** *define the size of the block*

>**obj.position**
**`vector2`** `{x,y}` *position of new object*

>**obj.color**
**`string`** `'#FFFFFF'` *colour of new object*

##### **properties**

>**physics**
**`physicsObject`** *attached physicsObject*

>**renderer**
**`renderObject`** *attached renderer*

#### emptyCompound *extends genericObject*

##### **new emptyCompound(obj)**

>**stub**

##### **properties**

>**physics**
**`physicsObject`** *attached physicsObject*

##### **methods**

>**addPart(obj)**
**`method`** *adds a child to the compound* 
_(stub)_
 >  - **obj**
    **`gameObject`** *Object to add *

>**removePart(obj)**
**`method`** *removes a child to the compound* 
_(stub)_
>  - **obj**
    **`gameObject`** *Object to remove *




### physics

#### properties

>**world**
**`Matter.World`** *instance of Matter's world object*

>**create**
**`object`** *library of instantiable physicsObjects*


### **physicsObject**

#### rectangle *extends physicsObject*

##### **new rectangle(obj)**

>**obj.width**
**`integer`** *width of rectangle*

>**obj.height**
**`integer`** *height of rectangle*

>**obj.position**
**`vector2`** `{x,y}` *position of new object*

>**rotation** 
**`number`**  *rotation of new object*

#### constraint *extends physicsObject*

##### **new constraint(obj)**

>**obj.stiffness**
**`integer`** *stiffness of joint

>**obj.A**
**`object`**

>**obj.A.body**
**`gameObject`** *Object A*

>**obj.A.vertex**
**`integer`** *Vertex of object A to attach to*

>**obj.A.attachTo**
**`integer`** *define a custom object for point A to attach to, overriding A.body*

>**obj.B**
**`object`**

>**obj.B.body**
**`gameObject`** *Object B*

>**obj.B.vertex**
**`gameObject`** *Vertex of object B to attach to*

>**obj.B.attachTo**
**`gameObject`** *define a custom object for point B to attach to, overriding B.body*


### renderer

##### **static methods**

>**worldToScreenspace(obj)** 
**`method`** *follow a specified gameObject*
>  - **obj**
    **`vector2`** `{x,y}` *position of object*
    
> *returns* **`vector2`** `{x,y}` *screen-space position of object*
    
>**getContext()** 
**`method`** *get the DOM canvas context*
    
> *returns* **`HTMLElement`** `<canvas>` *canvas currently used*


### **renderObject**

##### **methods**

>**remove()** 
**`method`**  *removes the object*