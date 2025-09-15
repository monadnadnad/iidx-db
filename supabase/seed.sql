insert into songs (title, textage_tag, bpm_min, bpm_max) values
('冥','_mei',66,200);

insert into charts (song_id, mode, diff, level, notes) values
((select id from songs where title='冥'),'SP','A',12,2000);
