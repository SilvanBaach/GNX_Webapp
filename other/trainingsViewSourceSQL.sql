WITH times AS (
    SELECT CAST(EXTRACT(epoch FROM day AT TIME ZONE 'CEST') AS INTEGER) AS time_series,
           to_char(to_timestamp(EXTRACT(epoch FROM day AT TIME ZONE 'CEST')), 'DD.MM.YYYY') AS readable_date
    FROM generate_series(current_date, current_date + interval '40 days', '1 day') AS day
),

     tmpData AS (
         SELECT times.time_series, readable_date, account.username, presence.state, teammembership.team_fk,
                CASE WHEN presence.from IS NULL OR presence.from = '' THEN '00:00' ELSE presence.from END AS from,
                CASE WHEN presence.until IS NULL OR presence.until = '' THEN '23:59' ELSE presence.until END AS until FROM account
                                                                                                                               LEFT JOIN teammembership ON teammembership.account_fk = account.id AND teammembership.active = 1 CROSS JOIN times
                                                                                                                               LEFT JOIN presence ON presence.account_fk = account.id AND presence.date = times.time_series AND presence.state <> 2 AND presence.state <> 3
         WHERE presence.date > EXTRACT(epoch FROM (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '23 hours 59 minutes')::timestamp AT TIME ZONE 'CEST') 			ORDER BY time_series
     ),

     counts AS (
         SELECT time_series, COUNT(*) AS playercount, team_fk, (SELECT displayname FROM team WHERE id = team_fk) AS team,
                (SELECT COUNT(*) FROM teammembership WHERE teammembership.team_fk = tmpData.team_fk AND teammembership.active = 1) AS totalplayers
         FROM tmpData
         GROUP BY time_series, team_fk
     ),


     tmpData2 AS(
         SELECT tmpData.*, counts.playercount, counts.team, counts.totalplayers FROM tmpData
                                                                                         JOIN counts ON tmpData.time_series = counts.time_series AND tmpData.team_fk = counts.team_fk
         ORDER BY tmpData.time_series
     ),


     tmpData3 AS (
         SELECT *, (SELECT MAX(x.from) FROM tmpData2 AS x WHERE x.time_series = tmpData2.time_series AND tmpData2.team_fk = team_fk) AS starttime,
                (SELECT MIN(x.until) FROM tmpData2 AS x WHERE x.time_series = tmpData2.time_series AND tmpData2.team_fk = team_fk) AS endtime
         FROM tmpData2
     )

SELECT * FROM (
                  SELECT time_series AS epochdate, readable_date, tmpData3.team_fk, team AS teamname, starttime, endtime, playercount, 'presence' AS traningtype,
                         totalplayers, 0 AS fixedtrainings_id
                  FROM tmpData3
                           FULL JOIN fixedtrainings ON fixedtrainings.team_fk = tmpData3.team_fk AND time_series = fixedtrainings."date"
                  WHERE fixedtrainings.id IS NULL AND starttime < endtime
                  GROUP BY time_series, readable_date, tmpData3.team_fk, team, starttime, endtime, playercount, totalplayers

                  UNION

                  SELECT "date" AS epochdate, TO_CHAR(TO_TIMESTAMP("date"), 'DD.MM.YYYY') AS readable_date, team_fk, team.displayname AS teamname, "from", "until",
                         -1 AS playercount, 'fixed' AS traningtype,
                         (SELECT COUNT(*) FROM teammembership WHERE teammembership.team_fk = team.id AND teammembership.active = 1) AS totalplayers, fixedtrainings.id AS fixedtrainings_id
                  FROM fixedtrainings
                           LEFT JOIN team ON team.id = team_fk
              ) AS tmpData4
ORDER BY epochdate, teamname