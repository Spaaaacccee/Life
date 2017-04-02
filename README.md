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

### **gameObject**

#### genericObject

##### **properties**

>**position** 
**`vector2`** `{x,y}` *gets or sets the position*

>**rotation** 
**`number`**  *gets or sets the rotation*

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
**`renderer`** *attached renderer*

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

>**obj.B**
**`object`**

>**obj.B.body**
**`gameObject`** *Object B*

>**obj.B.vertex**
**`integer`** *Vertex of object B to attach to*

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

