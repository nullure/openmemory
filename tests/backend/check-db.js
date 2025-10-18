const sqlite3 = require('../../backend/node_modules/sqlite3');
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '../../backend/data/openmemory.sqlite'));

console.log('📊 Database Contents:\n');

db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  console.log('Tables:', tables.map(t => t.name).join(', '));
  
  db.get('SELECT COUNT(*) as c FROM memories', (e1, r1) => {
    console.log('\n📝 Memories:', r1 ? r1.c : 'error');
    
    db.get('SELECT COUNT(*) as c FROM vectors', (e2, r2) => {
      console.log('🔢 Vectors:', r2 ? r2.c : 'error');
      
      db.get('SELECT COUNT(*) as c FROM waypoints', (e3, r3) => {
        console.log('🔗 Waypoints:', r3 ? r3.c : 'error');
        
        db.get('SELECT COUNT(*) as c FROM embed_logs', (e4, r4) => {
          console.log('📋 Embed_logs:', r4 ? r4.c : 'error');

          console.log('\n📄 Sample memories:');
          db.all('SELECT id, primary_sector, content FROM memories LIMIT 3', (e5, r5) => {
            if (r5 && r5.length > 0) {
              r5.forEach(m => console.log(`  ${m.id}: [${m.primary_sector}] ${m.content.substring(0, 50)}...`));
            } else {
              console.log('  (none)');
            }
            
            console.log('\n📄 Sample embed_logs:');
            db.all('SELECT id, status, model FROM embed_logs LIMIT 3', (e6, r6) => {
              if (r6 && r6.length > 0) {
                r6.forEach(l => console.log(`  ${l.id}: ${l.status} (${l.model})`));
              } else {
                console.log('  (none)');
              }
              
              db.close();
            });
          });
        });
      });
    });
  });
});
