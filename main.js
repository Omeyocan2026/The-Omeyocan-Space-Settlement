const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

const gridSizeRange = document.getElementById("grid-size-range");
const aliveCellRange = document.getElementById("alive-cells-range");
const speedRange = document.getElementById("speed-range");

const gridSizeH = document.getElementById('grid-size-header');
const aliveCellsH = document.getElementById('alive-cells-header');
const speedH = document.getElementById('speed-header');

const click = document.querySelector('button');
const pop = document.querySelector('#pop');
const gen = document.querySelector('#gen');
const blk = document.querySelector('#blk');

onSlideRange();

function onSlideRange(){
    const size = gridSizeRange.value;

    const max = Math.floor(size * size / 2.5);
    const min = Math.floor(size * size / 10);

    aliveCellRange.max = max.toString();
    aliveCellRange.min = min.toString();
    aliveCellRange.value = Math.floor((min + max) / 2).toString();

    gridSizeH.textContent = `Grid Size = ${size}`;
    aliveCellsH.textContent = `Alive Cells = ${aliveCellRange.value}`;
    speedH.textContent = `Speed = ${speedRange.value}`;
}

gridSizeRange.addEventListener('input', () => {
    onSlideRange();
});


speedRange.addEventListener('input', () =>{
    speedH.textContent = `Speed = ${speedRange.value}`;
});

aliveCellRange.addEventListener('input', () => {
    aliveCellsH.textContent = `Alive Cells = ${aliveCellRange.value}`;
});


let map_size, num_alive_cells, game_interval = null;
const map = [];
const delta_x = [1, 1, 1, -1, -1, -1, 0, 0];
const delta_y = [-1, 0, 1, -1, 0, 1, 1, -1];

click.addEventListener('click',() =>{
    if(game_interval != null){
        clearInterval(game_interval);
        game_interval = null;
        ctx.fillStyle = "whitesmoke";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        click.textContent = 'START';
        click.style.backgroundColor = 'green';
        pop.textContent = 'Population: 0 ';
        gen.textContent = 'Generation: 1 ';
        blk.textContent = 'Independent blocks: 0 ';
        return;
    }
    click.textContent = 'RESET';
    click.style.backgroundColor = 'hsla(15, 100%, 35%, 1.00)';
    game_loop();
});

function generate_map(size, num_alive)
{
    while(map.length > 0) map.pop();
    for(let i = 0; i < size; i++){
        const row = [];
        for(let j = 0; j < size; j++) row.push(0);
        map.push(row);
    }
    const visited = [];
    
    for(let i = 0; i < num_alive; i++){
        const not_visited = [];
        for(let j = 0; j < size * size; j++){
            let st = 0, dr = visited.length - 1, found = false;

            while(st <= dr && !found)
            {
                const p = Math.floor((st + dr) / 2);
                if(visited[p] == j) 
                    found = true;
                else if(visited[p] < j)
                    st = p + 1;
                else
                    dr = p - 1;
            }
            if(!found)
                not_visited.push(j);
        }
        const index = Math.round(Math.random() * (not_visited.length - 1));
        const map_i = Math.floor(not_visited[index] / map_size);
        const map_j = not_visited[index] % map_size;
        map[map_i][map_j] = 1;

        visited.push(not_visited[index]);
        let v_ind = visited.length - 1;
        while(v_ind > 0 && visited[v_ind - 1] > visited[v_ind])
        {
            const aux = visited[v_ind - 1];
            visited[v_ind - 1] = visited[v_ind];
            visited[v_ind] = aux;
            v_ind--;
        }
    }
}


function get_next_gen() {
    const modified_cells = [];
    for(let i = 0; i < map_size; i++) {
        for(let j = 0; j < map_size; j++) {
            let alive_counter = 0;
            for(let k = 0; k < 8; k++){
                const ni = i + delta_y[k], nj = j + delta_x[k];
                if(0 <= ni && ni < map_size && 0 <= nj && nj < map_size)
                    if(map[ni][nj] == 1)
                        alive_counter++;
            }
            if((map[i][j] == 0 && alive_counter == 3) || 
                (map[i][j] == 1 && (alive_counter < 2 || alive_counter > 3)))
                modified_cells.push({i: i, j: j});
        }
    }
    for(let k = 0; k < modified_cells.length; k++){
        const { i, j } = modified_cells[k];
        map[i][j] = (map[i][j] == 1) ? 0 : 1;
    }
}


function count_population() {
    let counter = 0;
    for(let i = 0; i < map_size; i++)
        for(let j = 0; j < map_size; j++)
            if(map[i][j] == 1) 
                counter ++;
    return counter;
}


function populate(a, i, j){
    if(a[i][j] == 0)
        return;
    else{
        a[i][j] = 0;
        for(let k = 0; k < 8; k++)
        {
            const ni = i + delta_y[k];
            const nj = j + delta_x[k];
            if(0 <= ni && ni < a.length && 0 <= nj && nj < a.length)
                populate(a, ni, nj);
        }
    }
}


function count_blocks() {
    const map_copy = [];
    for(let i = 0; i < map.length; i++){
        map_copy.push([]);
        for(let j = 0; j < map.length; j++)
            map_copy[i].push(map[i][j]); }
    let counter = 0;
    for(let i = 0; i < map.length; i++)
        for(let j = 0; j < map.length; j++)
            if(map_copy[i][j] != 0){
                counter++;
                populate(map_copy, i, j);}
    return counter;
}

function game_loop() {
    map_size = Math.floor(gridSizeRange.value);
    num_alive_cells = aliveCellRange.value;
    generate_map(map_size, num_alive_cells);
    let generation_num = 1, frame_counter = 1;
    let num_blocks = count_blocks();
    let num_population = count_population();
    const cell_size = canvas.width / map_size;
    if(game_interval != null){
        clearInterval(game_interval);
    }
    game_interval = setInterval(function() {
        pop.textContent = ' Population: ' + num_population ;
        gen.textContent = ' Generation: ' + generation_num ;
        blk.textContent = ' Independent blocks: ' + num_blocks ;
        if(frame_counter >= 4){
            get_next_gen();
            num_blocks = count_blocks();
            num_population = count_population();
            generation_num++;
            frame_counter = 0;}
        frame_counter += 1;
        ctx.fillStyle = "whitesmoke";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgb(0, 0, 0)";
        for(let i = 0; i < map_size; i++)
            for(let j = 0; j < map_size; j++)
                if(map[i][j] == 1){
                    ctx.fillRect(j * cell_size, i * cell_size,
                        cell_size, cell_size
                    );
                }
    }, 67-speedRange.value);}